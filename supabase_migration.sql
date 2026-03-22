-- Plans tablosu: her kullanıcının sınıf bazlı planlarını saklar
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sinif text not null,
  ders text not null,
  yil text not null,
  tip text not null check (tip in ('meb', 'yukle')),
  plan_json jsonb,
  rows_json jsonb,
  label text,
  sinif_gercek text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, sinif)
);

-- Row Level Security
alter table plans enable row level security;

create policy "Kullanıcılar kendi planlarını yönetebilir"
  on plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at otomatik güncelleme
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger plans_updated_at
  before update on plans
  for each row execute function update_updated_at();
