-- Server-owned data. Keep this schema out of the Supabase Data API.
create schema reviewkare;
revoke all on schema reviewkare from public, anon, authenticated, service_role;

create table reviewkare.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table reviewkare.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'unpaid'
    check (status in ('unpaid','active','readonly','suspended','deleted')),
  plan_id text check (plan_id in ('starter','growth','pro')),
  period_start timestamptz,
  period_end timestamptz,
  expired_at timestamptz,
  delete_at timestamptz,
  created_at timestamptz not null default now(),
  check (period_end > period_start),
  check (status <> 'active' or (plan_id is not null and period_start is not null and period_end is not null))
);

create table reviewkare.memberships (
  user_id uuid references reviewkare.profiles(id) on delete cascade,
  workspace_id uuid references reviewkare.workspaces(id) on delete cascade,
  role text not null check (role in ('owner','member')),
  primary key (user_id, workspace_id)
);

create table reviewkare.locations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references reviewkare.workspaces(id) on delete cascade,
  name text not null,
  place_id text,
  city text,
  timezone text not null default 'Asia/Kolkata',
  unique (workspace_id, id)
);

create table reviewkare.qr_codes (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null unique references reviewkare.locations(id) on delete cascade,
  code text not null unique,
  scans integer not null default 0 check (scans >= 0),
  drafts integer not null default 0 check (drafts >= 0)
);

create table reviewkare.reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  location_id uuid not null,
  google_review_id text,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null default '',
  status text not null default 'draft',
  draft_text text,
  final_text text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, location_id) references reviewkare.locations(workspace_id, id) on delete cascade,
  unique (location_id, google_review_id),
  unique (workspace_id, id)
);
create index reviews_workspace_created on reviewkare.reviews(workspace_id, created_at desc, id);

create table reviewkare.drafts (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviewkare.reviews(id) on delete cascade,
  text text not null,
  model text,
  status text not null default 'draft',
  approved_at timestamptz,
  approved_by uuid references reviewkare.profiles(id) on delete set null,
  unique (review_id, id)
);

create table reviewkare.google_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references reviewkare.workspaces(id) on delete cascade,
  encrypted_refresh_token text not null,
  scopes text[] not null default '{}',
  status text not null,
  last_synced_at timestamptz
);

create table reviewkare.milestones (
  workspace_id uuid references reviewkare.workspaces(id) on delete cascade,
  key text not null,
  achieved_at timestamptz not null default now(),
  primary key (workspace_id, key)
);

create table reviewkare.capabilities (
  token_hash text primary key,
  workspace_id uuid not null,
  review_id uuid not null,
  draft_id uuid not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  foreign key (workspace_id, review_id) references reviewkare.reviews(workspace_id, id) on delete cascade,
  foreign key (review_id, draft_id) references reviewkare.drafts(review_id, id) on delete cascade
);

-- Preserve audit references when an account is removed.
create table reviewkare.audit (
  id bigint generated always as identity primary key,
  workspace_id uuid,
  actor_user_id uuid,
  actor_type text not null,
  action text not null,
  target text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_workspace_created on reviewkare.audit(workspace_id, created_at desc);

create table reviewkare.sessions (
  hash text primary key,
  user_id uuid not null,
  workspace_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (user_id, workspace_id) references reviewkare.memberships(user_id, workspace_id) on delete cascade
);
create index sessions_expires on reviewkare.sessions(expires_at);

create table reviewkare.jobs (
  id bigint generated always as identity primary key,
  kind text not null,
  payload jsonb not null,
  run_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  locked_until timestamptz
);
create index jobs_run_at on reviewkare.jobs(run_at, id);

create table reviewkare.rate_limits (
  bucket text,
  window_start timestamptz,
  count integer not null check (count > 0),
  primary key (bucket, window_start)
);

create table reviewkare.requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table reviewkare.orders (
  id text primary key,
  workspace_id uuid references reviewkare.workspaces(id) on delete set null,
  plan_id text not null check (plan_id in ('starter','growth','pro')),
  months integer not null check (months in (1,3,6,12)),
  amount integer not null check (amount > 0),
  currency text not null check (currency = 'INR'),
  status text not null default 'created' check (status in ('created','failed','paid','refunded')),
  razorpay_payment_id text unique,
  created_at timestamptz not null default now(),
  check (status not in ('paid','refunded') or razorpay_payment_id is not null)
);

-- No browser access policies. Add service-specific grants and policies with
-- the route port. Opaque sessions and OAuth credentials stay server-side.
do $$
declare
  relation record;
begin
  for relation in select tablename from pg_tables where schemaname = 'reviewkare'
  loop
    execute format('alter table reviewkare.%I enable row level security', relation.tablename);
  end loop;
end;
$$;
revoke all on all tables in schema reviewkare from public, anon, authenticated, service_role;
revoke all on all sequences in schema reviewkare from public, anon, authenticated, service_role;
