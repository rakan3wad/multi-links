-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  email text unique not null,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create links table
create table public.links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  url text not null,
  description text,
  order_index integer not null default 0,
  is_active boolean default true
);

-- Set up Row Level Security (RLS)
alter table public.links enable row level security;

-- Create policies
create policy "Public links are viewable by everyone"
  on links for select
  using ( true );

create policy "Users can insert their own links"
  on links for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own links"
  on links for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own links"
  on links for delete
  using ( auth.uid() = user_id );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.email),
    new.email,
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
