create table if not exists icp_clusters (
  id text primary key,
  name text not null,
  description text not null,
  recommended_playbook text not null check (recommended_playbook in ('nimble', 'kylon', 'joint', 'none')),
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id text primary key,
  name text not null,
  domain text not null unique,
  lifecycle text not null check (lifecycle in ('paying', 'trial', 'evaluator', 'dormant', 'expansion', 'rejected')),
  industry text not null,
  employee_band text not null,
  current_products jsonb not null default '[]'::jsonb,
  trust_label text not null check (trust_label in ('verified', 'inferred', 'synthetic', 'cached')),
  primary_cluster_id text references icp_clusters(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists usage_records (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists engagements (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists form_submissions (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists meetings (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists evidence_items (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists analysis_runs (
  id text primary key,
  account_id text not null references accounts(id) on delete cascade,
  analysis_json jsonb not null,
  provider_modes_json jsonb not null,
  provider_warnings_json jsonb not null default '[]'::jsonb,
  kylon_packet_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id text primary key,
  run_id text not null references analysis_runs(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected', 'more_research')),
  action_json jsonb not null,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id text primary key,
  run_id text not null references analysis_runs(id) on delete cascade,
  account_id text not null references accounts(id) on delete cascade,
  occurred_at timestamptz not null,
  payload jsonb not null
);

create index if not exists accounts_lifecycle_idx on accounts(lifecycle);
create index if not exists accounts_cluster_idx on accounts(primary_cluster_id);
create index if not exists contacts_account_idx on contacts(account_id);
create index if not exists evidence_account_idx on evidence_items(account_id);
create index if not exists analysis_runs_account_idx on analysis_runs(account_id);
create index if not exists audit_events_run_idx on audit_events(run_id, occurred_at);
