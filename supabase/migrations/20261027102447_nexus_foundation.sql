-- Karmayogi Nexus. Reviewed migration; apply only to a selected new project.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.organizations(id uuid primary key default gen_random_uuid(),name text not null,created_at timestamptz not null default now());
create table public.departments(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,name text not null,unique(id,org_id));
create table public.profiles(id uuid primary key references auth.users on delete cascade,display_name text not null default 'Learner',context jsonb not null default '{}',created_at timestamptz not null default now());
create table public.memberships(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,org_id uuid not null references public.organizations,department_id uuid,role text not null check(role in ('learner','trainer','department_admin','platform_admin')),created_at timestamptz not null default now(),unique(user_id,org_id),foreign key(department_id,org_id) references public.departments(id,org_id));
create index memberships_org_role on public.memberships(org_id,role,user_id);
create index memberships_department on public.memberships(department_id);

create function private.is_member(oid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.memberships m where m.user_id=auth.uid() and m.org_id=oid);
$$;
create function private.has_role(oid uuid,allowed text[]) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.memberships m where m.user_id=auth.uid() and m.org_id=oid and m.role=any(allowed));
$$;
revoke all on function private.is_member(uuid),private.has_role(uuid,text[]) from public;
grant execute on function private.is_member(uuid),private.has_role(uuid,text[]) to authenticated;

-- Auth trigger is not an exposed RPC. It grants only learner, never metadata roles.
create function private.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$
declare oid uuid;
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'name','Learner'),100));
 insert into public.organizations(name) values('Personal learning workspace') returning id into oid;
 insert into public.memberships(user_id,org_id,role) values(new.id,oid,'learner');
 return new;
end;$$;
revoke all on function private.bootstrap_user() from public,anon,authenticated;
create trigger nexus_bootstrap_user after insert on auth.users for each row execute function private.bootstrap_user();

create table public.competency_frameworks(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,name text not null,version integer not null default 1,created_at timestamptz not null default now());
create table public.competencies(id text primary key,name text not null,category text not null);
create table public.role_competency_requirements(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,job_role text not null,competency_id text not null references public.competencies,target numeric not null check(target between 0 and 5),importance numeric not null check(importance between 0 and 1),unique(org_id,job_role,competency_id));
create table public.score_calculation_versions(id text primary key,weights jsonb not null,description text not null,created_at timestamptz not null default now());
create table public.competency_evidence(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,org_id uuid not null references public.organizations,competency_id text not null references public.competencies,level numeric not null check(level between 0 and 5),confidence numeric not null check(confidence between 0 and 1),kind text not null check(kind in ('diagnostic','practice','post-assessment','training')),source text not null,version text not null,created_at timestamptz not null default now());
create index evidence_user_date on public.competency_evidence(user_id,created_at desc);
create index evidence_org_competency on public.competency_evidence(org_id,competency_id);
create table public.courses(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,title text not null,provider text not null,source_url text,provenance text not null check(provenance in ('synthetic','verified-public','authorized-api')),hours numeric not null default 0 check(hours>=0),created_at timestamptz not null default now());
create table public.course_competencies(course_id uuid references public.courses on delete cascade,competency_id text references public.competencies,primary key(course_id,competency_id));
create table public.enrolments(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,course_id uuid not null references public.courses,completed_at timestamptz,created_at timestamptz not null default now(),unique(user_id,course_id));
create table public.training_programmes(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,title text not null,training_organization text not null,competencies text[] not null,delivery_mode text,eligibility text,start_date date,end_date date,hours numeric check(hours>=0),source_url text not null,verification text not null default 'unverified' check(verification in ('synthetic','unverified','verified')),tpac_evidence_url text,created_at timestamptz not null default now(),check(verification<>'verified' or tpac_evidence_url is not null));
create table public.learning_paths(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,title text not null,created_at timestamptz not null default now());
create table public.learning_path_items(path_id uuid references public.learning_paths on delete cascade,course_id uuid references public.courses,position integer not null,primary key(path_id,course_id));
create table public.learning_materials(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,org_id uuid not null references public.organizations,name text not null,storage_path text not null,mime text not null,bytes integer not null check(bytes between 1 and 10485760),status text not null default 'queued' check(status in ('queued','processing','ready','failed','transcript-required')),error text,published boolean not null default false,created_at timestamptz not null default now(),unique(id,org_id));
create table public.document_chunks(id uuid primary key default gen_random_uuid(),material_id uuid not null references public.learning_materials on delete cascade,ordinal integer not null,location text not null,content text not null check(length(content)<=8000),unique(material_id,ordinal));
create table public.document_processing_jobs(id uuid primary key default gen_random_uuid(),material_id uuid not null references public.learning_materials on delete cascade,status text not null default 'queued' check(status in ('queued','processing','completed','failed')),attempts integer not null default 0,locked_at timestamptz,last_error text,created_at timestamptz not null default now());
create table public.question_bank(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,user_id uuid not null references auth.users,material_id uuid not null references public.learning_materials,payload jsonb not null,status text not null default 'draft' check(status in ('draft','approved')),version integer not null default 1,model text not null,created_at timestamptz not null default now());
create table public.question_versions(id uuid primary key default gen_random_uuid(),question_id uuid not null references public.question_bank,version integer not null,payload jsonb not null,created_at timestamptz not null default now());
create table public.assessments(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,user_id uuid not null references auth.users,title text not null,question_ids uuid[] not null,kind text not null default 'practice' check(kind in ('practice','baseline','post-training')),published boolean not null default false,attempt_limit integer not null default 3 check(attempt_limit between 1 and 10),time_limit_minutes integer check(time_limit_minutes between 1 and 180),created_at timestamptz not null default now());
create table public.assessment_attempts(id uuid primary key default gen_random_uuid(),assessment_id uuid not null references public.assessments,user_id uuid not null references auth.users,org_id uuid not null references public.organizations,status text not null default 'in-progress' check(status in ('in-progress','submitted','expired')),responses jsonb not null default '{}',score numeric check(score between 0 and 100),result jsonb,deadline timestamptz,created_at timestamptz not null default now(),submitted_at timestamptz);
create index attempts_user_assessment on public.assessment_attempts(user_id,assessment_id,created_at desc);
create unique index one_active_attempt on public.assessment_attempts(user_id,assessment_id) where status='in-progress';
create table private.attempt_keys(attempt_id uuid primary key references public.assessment_attempts on delete cascade,questions jsonb not null);
create table private.assessment_keys(assessment_id uuid primary key references public.assessments on delete cascade,questions jsonb not null);
create table public.lab_submissions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,org_id uuid not null references public.organizations,lab_id text not null,input jsonb not null,score numeric not null check(score between 0 and 100),feedback text not null,created_at timestamptz not null default now());
create index labs_user_date on public.lab_submissions(user_id,created_at desc);
create table public.chat_sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,created_at timestamptz not null default now());
create table public.chat_messages(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,role text not null check(role in ('user','assistant')),content text not null check(length(content)<=12000),created_at timestamptz not null default now());
create index messages_user_date on public.chat_messages(user_id,created_at);
create table public.workforce_scenarios(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users,org_id uuid not null references public.organizations,assumptions jsonb not null,result jsonb not null,created_at timestamptz not null default now());
create table public.integration_configs(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,provider text not null,mode text not null default 'demo' check(mode in ('demo','authorized')),status text not null default 'not-configured',created_at timestamptz not null default now());
create table public.integration_sync_runs(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.organizations,provider text not null,status text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users,org_id uuid references public.organizations,action text not null,resource_id uuid,created_at timestamptz not null default now());
create index audit_org_date on public.audit_logs(org_id,created_at desc);

-- Deny by default. No grants to anon. Authorization tables never writable by clients.
do $$declare t text;begin
 for t in select tablename from pg_tables where schemaname='public' loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end;$$;
grant select on all tables in schema public to authenticated;
grant update(display_name,context) on public.profiles to authenticated;
create policy profiles_self on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_edit on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy memberships_self on public.memberships for select to authenticated using(user_id=(select auth.uid()));
create policy organizations_member on public.organizations for select to authenticated using(private.is_member(id));
create policy departments_member on public.departments for select to authenticated using(private.is_member(org_id));
create policy competencies_read on public.competencies for select to authenticated using(true);
create policy scoring_read on public.score_calculation_versions for select to authenticated using(true);
do $$declare t text;begin
 foreach t in array array['competency_frameworks','role_competency_requirements','courses','training_programmes','assessments'] loop
  execute format('create policy %I on public.%I for select to authenticated using(private.is_member(org_id))',t||'_member_read',t);
 end loop;
 foreach t in array array['competency_evidence','assessment_attempts','lab_submissions','chat_sessions','chat_messages','learning_paths','workforce_scenarios'] loop
  execute format('create policy %I on public.%I for select to authenticated using(user_id=(select auth.uid()))',t||'_self_read',t);
 end loop;
 foreach t in array array['integration_configs','integration_sync_runs','audit_logs'] loop
  execute format('create policy %I on public.%I for select to authenticated using(private.has_role(org_id,array[''platform_admin'']))',t||'_admin_read',t);
 end loop;
end;$$;
create policy course_competencies_read on public.course_competencies for select to authenticated using(exists(select 1 from public.courses c where c.id=course_id));
create policy enrolments_self on public.enrolments for select to authenticated using(user_id=(select auth.uid()));
create policy path_items_self on public.learning_path_items for select to authenticated using(exists(select 1 from public.learning_paths p where p.id=path_id and p.user_id=(select auth.uid())));
create policy materials_read on public.learning_materials for select to authenticated using(user_id=(select auth.uid()) or (published and private.is_member(org_id)));
create policy chunks_read on public.document_chunks for select to authenticated using(exists(select 1 from public.learning_materials m where m.id=material_id));
create policy jobs_owner on public.document_processing_jobs for select to authenticated using(exists(select 1 from public.learning_materials m where m.id=material_id and m.user_id=(select auth.uid())));
create policy questions_owner on public.question_bank for select to authenticated using(user_id=(select auth.uid()) and private.has_role(org_id,array['trainer','platform_admin']));
create policy question_versions_owner on public.question_versions for select to authenticated using(exists(select 1 from public.question_bank q where q.id=question_id));

-- Owner-controlled trainer writes, with org-bound FK protection and draft validation.
grant insert,update,delete on public.learning_materials,public.document_chunks,public.document_processing_jobs,public.question_bank to authenticated;
create policy materials_write on public.learning_materials for all to authenticated using(user_id=(select auth.uid()) and private.has_role(org_id,array['trainer','platform_admin'])) with check(user_id=(select auth.uid()) and private.has_role(org_id,array['trainer','platform_admin']));
create policy chunks_write on public.document_chunks for all to authenticated using(exists(select 1 from public.learning_materials m where m.id=material_id and m.user_id=(select auth.uid()) and private.has_role(m.org_id,array['trainer','platform_admin']))) with check(exists(select 1 from public.learning_materials m where m.id=material_id and m.user_id=(select auth.uid()) and private.has_role(m.org_id,array['trainer','platform_admin'])));
create policy jobs_write on public.document_processing_jobs for all to authenticated using(exists(select 1 from public.learning_materials m where m.id=material_id and m.user_id=(select auth.uid()) and private.has_role(m.org_id,array['trainer','platform_admin']))) with check(exists(select 1 from public.learning_materials m where m.id=material_id and m.user_id=(select auth.uid()) and private.has_role(m.org_id,array['trainer','platform_admin'])));
create policy questions_write on public.question_bank for all to authenticated using(user_id=(select auth.uid()) and private.has_role(org_id,array['trainer','platform_admin'])) with check(user_id=(select auth.uid()) and private.has_role(org_id,array['trainer','platform_admin']) and exists(select 1 from public.learning_materials m where m.id=material_id and m.org_id=question_bank.org_id and m.user_id=(select auth.uid())));
grant insert,delete on public.chat_messages to authenticated;
create policy chat_write on public.chat_messages for insert to authenticated with check(user_id=(select auth.uid()));
create policy chat_delete on public.chat_messages for delete to authenticated using(user_id=(select auth.uid()));

-- All assessment writes go through these authenticated, audited, constrained RPCs.
create function private.publish_assessment(title text,ids uuid[]) returns uuid language plpgsql security definer set search_path='' as $$
declare oid uuid; aid uuid; n integer; qs jsonb;
begin
 select org_id into oid from public.memberships where user_id=auth.uid() and role in ('trainer','platform_admin') limit 1;
 if auth.uid() is null or oid is null then raise exception 'Not authorized';end if;
 n:=coalesce(array_length(ids,1),0);
 if n<1 or n>50 or (select count(*) from public.question_bank where id=any(ids) and user_id=auth.uid() and org_id=oid and status='approved')<>n then raise exception 'Every question must be reviewed and approved';end if;
 insert into public.assessments(org_id,user_id,title,question_ids,published) values(oid,auth.uid(),left(title,150),ids,true) returning id into aid;
 select jsonb_agg(payload||jsonb_build_object('id',id,'version',version) order by id) into qs from public.question_bank where id=any(ids) and org_id=oid;
 insert into private.assessment_keys values(aid,qs);
 insert into public.audit_logs(user_id,org_id,action,resource_id)values(auth.uid(),oid,'assessment.published',aid);
 return aid;
end;$$;
create function public.publish_assessment(title text,ids uuid[]) returns uuid language sql security invoker set search_path='' as $$select private.publish_assessment(title,ids)$$;

create function private.start_assessment(aid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.assessments; at public.assessment_attempts; qs jsonb; pqs jsonb;
begin
 select * into a from public.assessments where id=aid and published;
 if auth.uid() is null or a.id is null or not private.is_member(a.org_id) then raise exception 'Assessment unavailable';end if;
 -- Serialize attempt creation for this learner/assessment, including concurrent calls.
 perform pg_advisory_xact_lock(hashtext(auth.uid()::text||aid::text));
 update public.assessment_attempts set status='expired' where user_id=auth.uid() and assessment_id=aid and status='in-progress' and deadline<now();
 select * into at from public.assessment_attempts where user_id=auth.uid() and assessment_id=aid and status='in-progress';
 if at.id is null then
  if(select count(*) from public.assessment_attempts where user_id=auth.uid() and assessment_id=aid)>=a.attempt_limit then raise exception 'Attempt limit reached';end if;
  insert into public.assessment_attempts(assessment_id,user_id,org_id,deadline) values(aid,auth.uid(),a.org_id,case when a.time_limit_minutes is null then null else now()+make_interval(mins=>a.time_limit_minutes) end) returning * into at;
  select jsonb_agg(q order by md5(q->>'id'||at.id::text)) into qs from private.assessment_keys ak,jsonb_array_elements(ak.questions) q where ak.assessment_id=a.id;
  if qs is null then raise exception 'No questions';end if;
  insert into private.attempt_keys values(at.id,qs);
 else select questions into qs from private.attempt_keys where attempt_id=at.id;
 end if;
 select jsonb_agg(q-'answer'-'explanation'-'quote') into pqs from jsonb_array_elements(qs) q;
 return jsonb_build_object('attemptId',at.id,'questions',pqs,'responses',at.responses,'deadline',at.deadline);
end;$$;
create function public.start_assessment(aid uuid) returns jsonb language sql security invoker set search_path='' as $$select private.start_assessment(aid)$$;

create function private.save_assessment(atid uuid,answers jsonb,finish boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare at public.assessment_attempts; qs jsonb; q jsonb; selected jsonb; expected jsonb; results jsonb:='[]'; correct integer:=0; total integer:=0; k text; val jsonb; is_correct boolean; pct numeric; rec record;
begin
 if auth.uid() is null then raise exception 'Not authorized';end if;
 select * into at from public.assessment_attempts where id=atid and user_id=auth.uid() for update;
 if at.id is null or at.status<>'in-progress' then raise exception 'Attempt unavailable or already submitted';end if;
 if at.deadline is not null and at.deadline<now() then raise exception 'Attempt expired';end if;
 select questions into qs from private.attempt_keys where attempt_id=atid;
 if jsonb_typeof(answers)<>'object' or octet_length(answers::text)>20000 then raise exception 'Invalid answers';end if;
 for k,val in select * from jsonb_each(answers) loop
  if not exists(select 1 from jsonb_array_elements(qs) x where x->>'id'=k) or jsonb_typeof(val)<>'array' then raise exception 'Invalid question';end if;
  if jsonb_array_length(val)<>(select count(distinct x) from jsonb_array_elements(val)x) then raise exception 'Duplicate option';end if;
  if exists(select 1 from jsonb_array_elements_text(val)x where x!~'^[0-9]+$' or length(x)>2) then raise exception 'Invalid option';end if;
 end loop;
 for q in select * from jsonb_array_elements(qs) loop
  selected:=coalesce(answers->(q->>'id'),'[]');
  if exists(select 1 from jsonb_array_elements_text(selected)x where x::int>=jsonb_array_length(q->'options')) then raise exception 'Invalid option index';end if;
  if q->>'type'<>'multiple' and jsonb_array_length(selected)>1 then raise exception 'One answer required';end if;
  select coalesce(jsonb_agg(x order by x),'[]') into selected from jsonb_array_elements(selected)x;
  select jsonb_agg(x order by x) into expected from jsonb_array_elements(q->'answer')x;
  is_correct:=selected=expected;
  total:=total+1;if is_correct then correct:=correct+1;end if;
  results:=results||jsonb_build_array(jsonb_build_object('questionId',q->>'id','competencyId',q->>'competencyId','correct',is_correct,'explanation',q->>'explanation','answer',q->'answer'));
 end loop;
 if not finish then update public.assessment_attempts set responses=answers where id=atid;return '{"saved":true}';end if;
 pct:=round(correct::numeric/greatest(total,1)*100);
 update public.assessment_attempts set status='submitted',responses=answers,score=pct,result=jsonb_build_object('score',pct,'results',results),submitted_at=now() where id=atid;
 for rec in select x->>'competencyId' cid,count(*) n,count(*) filter(where (x->>'correct')::boolean) c from jsonb_array_elements(results)x group by 1 loop
  insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version) values(auth.uid(),at.org_id,rec.cid,5.0*rec.c/rec.n,least(.85,.3+rec.n*.08),'post-assessment','Assessment '||at.assessment_id||' attempt '||atid||' ('||rec.n||' questions)','nexus-weighted-evidence-v1');
 end loop;
 insert into public.audit_logs(user_id,org_id,action,resource_id)values(auth.uid(),at.org_id,'assessment.submitted',atid);
 return jsonb_build_object('score',pct,'results',results);
end;$$;
create function public.save_assessment(atid uuid,answers jsonb,finish boolean default false) returns jsonb language sql security invoker set search_path='' as $$select private.save_assessment(atid,answers,finish)$$;

create function private.record_lab(lab text,submission jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare oid uuid;pct numeric:=0;cid text;fb text;v numeric;good integer;bad integer;query text;
begin
 select org_id into oid from public.memberships where user_id=auth.uid() limit 1;
 if auth.uid() is null or oid is null then raise exception 'Not authorized';end if;
 if lab='quality' then
  if jsonb_typeof(submission)<>'array' or jsonb_array_length(submission)>7 then raise exception 'Invalid flags';end if;
  select count(*) filter(where x between 0 and 4),count(*) filter(where x not between 0 and 4) into good,bad from(select distinct value::int x from jsonb_array_elements_text(submission))s;
  pct:=greatest(0,(good-bad)*20);cid:='quality';fb:='Review missing income, duplicate ID, inconsistent region case, implausible age and extreme income. Flags require investigation, not automatic deletion.';
 elsif lab='sampling' then
  if abs((submission->>'weight')::numeric-5)<.001 then pct:=50;end if;
  if abs((submission->>'mean')::numeric-26)<.01 then pct:=pct+50;end if;
  cid:='sampling';fb:='Weight = 1/0.2 = 5. Weighted mean = (10*1+30*4)/(1+4) = 26.';
 elsif lab='interpretation' then pct:=case when submission='1' then 100 else 0 end;cid:='communication';fb:='40% to 50% is a 10 percentage point increase. The cause is not established.';
 elsif lab='sql' then
  query:=lower(trim(regexp_replace(trim(both '"' from submission::text),'\s+',' ','g')));query:=rtrim(query,';');cid:='sql';
  if query='select count(*) from survey' then pct:=100;fb:='COUNT(*) = 6. Fixed synthetic dataset only.';
  elsif query='select region, count(*) from survey group by region' then pct:=75;fb:='North:2; South:1; north:1; East:1; West:1. Try COUNT(*) for the mission objective.';
  else fb:='Query rejected: restricted grammar only. No SQL was executed.';end if;
 else raise exception 'Unknown lab';end if;
 insert into public.lab_submissions(user_id,org_id,lab_id,input,score,feedback)values(auth.uid(),oid,lab,submission,pct,fb);
 insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version)values(auth.uid(),oid,cid,pct/20,.6,'practice','Mission lab: '||lab,'lab-rules-v1');
 return jsonb_build_object('score',pct,'feedback',fb);
end;$$;
create function public.record_lab(lab text,submission jsonb) returns jsonb language sql security invoker set search_path='' as $$select private.record_lab(lab,submission)$$;

create function private.workforce_summary() returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.memberships; data jsonb;
begin
 select * into m from public.memberships where user_id=auth.uid() and role in ('department_admin','platform_admin') limit 1;
 if auth.uid() is null or m.id is null then raise exception 'Not authorized';end if;
 -- Counts below five are suppressed; never return identifiable learner records.
 select coalesce(jsonb_agg(t),'[]') into data from(select e.competency_id,count(distinct e.user_id) learners,round(avg(e.level),2) mean_level from (select distinct on (user_id,competency_id) * from public.competency_evidence where org_id=m.org_id and kind<>'training' order by user_id,competency_id,created_at desc,id) e join public.memberships l on l.user_id=e.user_id and l.org_id=e.org_id where (m.role='platform_admin' or l.department_id=m.department_id) group by e.competency_id having count(distinct e.user_id)>=5)t;
 return data;
end;$$;
create function public.workforce_summary() returns jsonb language sql security invoker set search_path='' as $$select private.workforce_summary()$$;

revoke all on all functions in schema private from public,anon;
grant execute on function private.publish_assessment(text,uuid[]),private.start_assessment(uuid),private.save_assessment(uuid,jsonb,boolean),private.record_lab(text,jsonb),private.workforce_summary() to authenticated;
revoke all on function public.publish_assessment(text,uuid[]),public.start_assessment(uuid),public.save_assessment(uuid,jsonb,boolean),public.record_lab(text,jsonb),public.workforce_summary() from public,anon;
grant execute on function public.publish_assessment(text,uuid[]),public.start_assessment(uuid),public.save_assessment(uuid,jsonb,boolean),public.record_lab(text,jsonb),public.workforce_summary() to authenticated;

insert into public.competencies(id,name,category) values('sampling','Sampling & estimation','Statistical'),('quality','Survey data quality','Statistical'),('python','Python','Technical'),('sql','SQL & data handling','Technical'),('privacy','Data privacy','Digital governance'),('communication','Statistical communication','Behavioural'),('gis','GIS','Technical'),('metadata','Metadata standards','Statistical') on conflict do nothing;
insert into public.score_calculation_versions values('nexus-weighted-evidence-v1','{"gap":0.4,"importance":0.25,"department":0.2,"prerequisite":0.15}','Proposed initial weights. No scientific or government validation.',now()) on conflict do nothing;
