create extension if not exists vector;

create table animals (
  id           text primary key,
  care_nm      text not null,
  care_tel     text,
  region_cd    text not null,
  city_cd      text,
  kind         text,
  age          text,
  sex          char(1),
  weight       text,
  feature      text,
  image_url    text,
  status       text default '보호중',
  notice_edt   date,
  embedding    vector(1536),
  synced_at    timestamptz default now(),
  stale        boolean default false
);

create index on animals using hnsw (embedding vector_cosine_ops);
create index on animals (region_cd, status);

create table favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  animal_id  text references animals(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, animal_id)
);

create index on favorites (user_id);

alter table favorites enable row level security;

create policy "사용자는 자신의 찜만 조회"
  on favorites for select using (user_id = auth.uid());

create policy "사용자는 자신의 찜만 추가"
  on favorites for insert with check (user_id = auth.uid());

create policy "사용자는 자신의 찜만 삭제"
  on favorites for delete using (user_id = auth.uid());
