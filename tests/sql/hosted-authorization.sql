-- Execute with the trusted project SQL connection, never through an exposed RPC.
-- Synthetic identities exist only inside this rolled-back transaction.
-- This tests actual hosted PostgreSQL/RLS, not email delivery or browser Auth.
begin;
do $test$
declare
 a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); t uuid := gen_random_uuid();
 oa uuid; ob uuid; mid uuid := gen_random_uuid(); cid uuid := gen_random_uuid();
 qid uuid := gen_random_uuid(); aid uuid; atid uuid; result jsonb; n integer;
begin
 insert into auth.users(id,raw_user_meta_data) values
 (a,'{"name":"Synthetic hosted learner","role":"platform_admin"}'),
 (b,'{"name":"Synthetic other tenant"}'),(t,'{"name":"Synthetic trainer"}');
 select org_id into oa from public.memberships where user_id=a;
 select org_id into ob from public.memberships where user_id=b;
 if (select role from public.memberships where user_id=a)<>'learner' then raise exception 'Metadata privilege escalation';end if;
 update public.memberships set org_id=oa,role='trainer' where user_id=t;
 insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version)
 values(b,ob,'sampling',2,.6,'diagnostic','Rolled-back synthetic test','test-v1');
 insert into public.learning_materials(id,user_id,org_id,name,storage_path,mime,bytes,status)
 values(mid,t,oa,'Synthetic hosted source.md',t||'/source.md','text/markdown',80,'ready');
 insert into public.document_chunks(id,material_id,ordinal,location,content,embedding)
 values(cid,mid,0,'Synthetic section','Stratified sampling divides a population into mutually exclusive groups.',array_fill(.01::real,array[1536])::extensions.vector);
 insert into public.question_bank(id,user_id,org_id,material_id,payload,model)
 values(qid,t,oa,mid,jsonb_build_object('stem','Which design samples independently inside population groups?',
 'options',jsonb_build_array('Stratified','Convenience'),'answer',jsonb_build_array(0),
 'explanation','Separate samples within strata are stratified sampling.','competencyId','sampling',
 'difficulty',2,'type','single','source',cid,'quote','Stratified sampling divides a population'),'synthetic-test');

 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 if exists(select 1 from public.competency_evidence) then raise exception 'Cross-user evidence disclosure';end if;
 if exists(select 1 from public.organizations where id=ob) then raise exception 'Cross-tenant disclosure';end if;
 if exists(select 1 from public.document_chunks) then raise exception 'Private source disclosure';end if;
 if exists(select 1 from public.question_bank) then raise exception 'Question bank disclosure';end if;
 if exists(select 1 from public.match_document_chunks(array_fill(.01::real,array[1536])::extensions.vector,6)) then raise exception 'Vector retrieval disclosure';end if;
 begin
  update public.memberships set role='platform_admin' where user_id=a;
  raise exception 'Role write unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.competency_evidence(user_id,org_id,competency_id,level,confidence,kind,source,version)
  values(a,oa,'sampling',5,1,'practice','forged','forged');
  raise exception 'Evidence forgery unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  perform 1 from private.attempt_keys;
  raise exception 'Protected answer keys readable';
 exception when insufficient_privilege then null;end;
 begin
  insert into storage.objects(bucket_id,name) values('learning-materials',a||'/forged.txt');
  raise exception 'Learner upload unexpectedly allowed';
 exception when insufficient_privilege then null;end;
 begin
  perform public.workforce_summary();
  raise exception 'Learner administrator analytics unexpectedly allowed';
 exception when raise_exception then if sqlerrm not like '%Not authorized%' then raise;end if;end;
 result:=public.record_lab('sampling','{"weight":5,"mean":26,"score":0}');
 if (result->>'score')::numeric<>100 then raise exception 'Trusted lab grading failed';end if;
 result:=public.record_lab('sql',to_jsonb('select * from profiles; drop table profiles'::text));
 if (result->>'score')::numeric<>0 then raise exception 'SQL probe accepted';end if;
 for n in 1..20 loop
  if not public.take_ai_budget('tutor') then raise exception 'Budget denied too early';end if;
 end loop;
 if public.take_ai_budget('tutor') then raise exception 'Quota exceeded';end if;

 execute 'reset role';
 perform set_config('request.jwt.claim.sub',t::text,true);
 execute 'set local role authenticated';
 if (select count(*) from public.match_document_chunks(array_fill(.01::real,array[1536])::extensions.vector,6))<>1 then raise exception 'Owner vector retrieval failed';end if;
 begin
  insert into storage.objects(bucket_id,name) values('learning-materials',b||'/forged.txt');
  raise exception 'Cross-owner storage path accepted';
 exception when insufficient_privilege then null;end;
 insert into storage.objects(bucket_id,name) values('learning-materials',t||'/source.md');
 if (select count(*) from storage.objects where bucket_id='learning-materials' and name=t||'/source.md')<>1 then raise exception 'Owner storage metadata inaccessible';end if;
 begin
  perform public.publish_assessment('Synthetic draft',array[qid]);
  raise exception 'Draft publication unexpectedly allowed';
 exception when raise_exception then if sqlerrm not like '%approved%' then raise;end if;end;
 update public.question_bank set status='approved',version=2 where id=qid;
 aid:=public.publish_assessment('Synthetic approved assessment',array[qid]);
 update public.question_bank set payload=jsonb_set(payload,'{answer}','[1]'),version=3,status='draft' where id=qid;

 execute 'reset role';
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 if exists(select 1 from storage.objects where bucket_id='learning-materials') then raise exception 'Cross-owner storage disclosure';end if;
 result:=public.start_assessment(aid);atid:=(result->>'attemptId')::uuid;
 if (result->'questions'->0) ?| array['answer','explanation','quote'] then raise exception 'Protected answer leakage';end if;
 begin
  perform public.save_assessment(atid,jsonb_build_object(qid::text,jsonb_build_array(9)),true);
  raise exception 'Invalid option accepted';
 exception when raise_exception then if sqlerrm not like '%Invalid option%' then raise;end if;end;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',b::text,true);
 execute 'set local role authenticated';
 begin
  perform public.save_assessment(atid,jsonb_build_object(qid::text,jsonb_build_array(0)),true);
  raise exception 'Cross-user grading accepted';
 exception when raise_exception then if sqlerrm not like '%unavailable%' then raise;end if;end;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub',a::text,true);
 execute 'set local role authenticated';
 result:=public.save_assessment(atid,jsonb_build_object(qid::text,jsonb_build_array(0)),true);
 if (result->>'score')::numeric<>100 then raise exception 'Frozen published answer grading failed';end if;
 if not exists(select 1 from public.competency_evidence where user_id=a and kind='post-assessment') then raise exception 'Assessment evidence not persisted';end if;
 begin
  perform public.save_assessment(atid,jsonb_build_object(qid::text,jsonb_build_array(1)),true);
  raise exception 'Submission replay accepted';
 exception when raise_exception then if sqlerrm not like '%already submitted%' then raise;end if;end;
 execute 'reset role';
 perform set_config('request.jwt.claim.sub','',true);
 execute 'set local role anon';
 begin
  perform 1 from public.profiles;
  raise exception 'Anonymous profile access allowed';
 exception when insufficient_privilege then null;end;
 execute 'reset role';
end;
$test$;
rollback;
select 'PASS: hosted isolation, storage metadata policies, vector retrieval, trusted grading, publication snapshot, answer redaction, replay prevention and AI quota. All synthetic changes rolled back.' as result;
