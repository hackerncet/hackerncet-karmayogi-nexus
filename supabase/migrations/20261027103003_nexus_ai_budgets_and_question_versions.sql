create table private.ai_request_log(user_id uuid not null,created_at timestamptz not null default now(),purpose text not null);
create index ai_requests_user_time on private.ai_request_log(user_id,created_at);
create function private.take_ai_budget(purpose text) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null or purpose not in ('tutor','questions') then raise exception 'Not authorized';end if;
 perform pg_advisory_xact_lock(hashtext('ai:'||auth.uid()::text));
 select count(*) into n from private.ai_request_log where user_id=auth.uid() and created_at>now()-interval '1 hour';
 if n>=20 then return false;end if;
 delete from private.ai_request_log where user_id=auth.uid() and created_at<now()-interval '1 day';
 insert into private.ai_request_log values(auth.uid(),now(),purpose);return true;
end;$$;
create function public.take_ai_budget(purpose text) returns boolean language sql security invoker set search_path='' as $$select private.take_ai_budget(purpose)$$;
revoke all on function private.take_ai_budget(text),public.take_ai_budget(text) from public,anon;
grant execute on function private.take_ai_budget(text),public.take_ai_budget(text) to authenticated;

create function private.question_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if jsonb_typeof(new.payload->'options')<>'array' or jsonb_typeof(new.payload->'answer')<>'array' or coalesce(length(new.payload->>'stem'),0)<15 or jsonb_array_length(new.payload->'answer')<1 then raise exception 'Invalid question structure';end if;
 if new.status='approved' and not exists(select 1 from public.document_chunks c where c.material_id=new.material_id and c.id::text=new.payload->>'source' and position(new.payload->>'quote' in c.content)>0 and length(new.payload->>'quote')>=20) then raise exception 'Approval requires an exact supporting citation';end if;
 insert into public.question_versions(question_id,version,payload)values(new.id,new.version,new.payload);
 insert into public.audit_logs(user_id,org_id,action,resource_id) values(auth.uid(),new.org_id,'question.'||new.status,new.id);
 return new;
end;$$;
revoke all on function private.question_history() from public,anon,authenticated;
create trigger question_history after insert or update on public.question_bank for each row execute function private.question_history();
alter table public.question_versions drop constraint question_versions_question_id_fkey;
alter table public.question_versions add foreign key(question_id) references public.question_bank on delete cascade;
grant insert on public.workforce_scenarios to authenticated;
create policy scenario_insert on public.workforce_scenarios for insert to authenticated with check(user_id=(select auth.uid()) and private.has_role(org_id,array['department_admin','platform_admin']));
