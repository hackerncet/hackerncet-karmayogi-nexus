create schema if not exists extensions;
create extension if not exists vector with schema extensions;
alter table public.document_chunks add column embedding extensions.vector(1536);
-- Exact nearest-neighbor search initially. Add HNSW only after corpus/query benchmarks.
create function public.match_document_chunks(query_embedding extensions.vector(1536),match_count integer default 6)
returns table(id uuid,material_id uuid,location text,content text,similarity float)
language sql stable security invoker set search_path='' as $$
 select c.id,c.material_id,c.location,c.content,1-(c.embedding operator(extensions.<=>) query_embedding) similarity
 from public.document_chunks c where c.embedding is not null
 order by c.embedding operator(extensions.<=>) query_embedding limit least(greatest(match_count,1),10);
$$;
revoke all on function public.match_document_chunks(extensions.vector,integer) from public,anon;
grant execute on function public.match_document_chunks(extensions.vector,integer) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('learning-materials','learning-materials',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/markdown','video/mp4']) on conflict(id) do nothing;
create policy nexus_storage_read on storage.objects for select to authenticated using(bucket_id='learning-materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy nexus_storage_insert on storage.objects for insert to authenticated with check(bucket_id='learning-materials' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.role in ('trainer','platform_admin')));
create policy nexus_storage_delete on storage.objects for delete to authenticated using(bucket_id='learning-materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
