-- ============================================================
-- Heated Rivalry v2 — Schema
-- Run this entire file in the Supabase SQL editor (once).
-- ============================================================

-- ── 1. Profiles ──────────────────────────────────────────────
-- Mirrors auth.users; populated automatically on first sign-in.

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  created_at   timestamptz DEFAULT now()
);

-- Trigger: auto-create a profile row when a new user signs up via Google
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. Competitions ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  created_by  uuid REFERENCES auth.users(id) NOT NULL,
  player1_id  uuid REFERENCES profiles(id) NOT NULL,
  player2_id  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- ── 3. Invites ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invites (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  token          text UNIQUE NOT NULL,
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at     timestamptz DEFAULT now()
);

-- ── 4. Steps (replaces step rows in workouts) ─────────────────

CREATE TABLE IF NOT EXISTS steps (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) NOT NULL,
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  date           date NOT NULL,
  steps          integer NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ── 5. Alter workouts ─────────────────────────────────────────
-- Add user_id and competition_id columns to the existing table.
-- person column is kept as-is; migration script updates its values.

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS user_id        uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES competitions(id);

-- ── 6. RLS Policies ───────────────────────────────────────────

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts     ENABLE ROW LEVEL SECURITY;

-- profiles: any signed-in user can read; only owner can update
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- competitions: only participants can read
CREATE POLICY "competitions_select" ON competitions
  FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- any authenticated user can create a competition (as player1)
CREATE POLICY "competitions_insert" ON competitions
  FOR INSERT WITH CHECK (auth.uid() = created_by AND auth.uid() = player1_id);

-- invites: authenticated users can read (token is the secret)
CREATE POLICY "invites_select" ON invites
  FOR SELECT USING (auth.role() = 'authenticated');

-- only competition creator can create an invite
CREATE POLICY "invites_insert" ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions
      WHERE id = competition_id AND created_by = auth.uid()
    )
  );

-- workouts: participants of the same competition can read
CREATE POLICY "workouts_select" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitions
      WHERE id = competition_id
        AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "workouts_insert" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions
      WHERE id = competition_id
        AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "workouts_delete" ON workouts
  FOR DELETE USING (person = auth.uid()::text);

-- steps: participants of the same competition can read; only owner can write
CREATE POLICY "steps_select" ON steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitions
      WHERE id = competition_id
        AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "steps_insert" ON steps
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "steps_update" ON steps
  FOR UPDATE USING (user_id = auth.uid());

-- ── 7. accept_invite RPC ──────────────────────────────────────
-- Called by the joining player. Runs with SECURITY DEFINER so it can
-- update competitions and invites regardless of the caller's RLS context.

CREATE OR REPLACE FUNCTION accept_invite(p_token text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_invite       invites%ROWTYPE;
  v_competition  competitions%ROWTYPE;
BEGIN
  -- Look up the pending invite
  SELECT * INTO v_invite
  FROM invites
  WHERE token = p_token AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'This invite link is invalid or has already been used.');
  END IF;

  -- Look up the competition
  SELECT * INTO v_competition
  FROM competitions
  WHERE id = v_invite.competition_id;

  -- Prevent the creator from joining their own competition
  IF v_competition.player1_id = auth.uid() THEN
    RETURN json_build_object('error', 'You created this competition — share the link with someone else.');
  END IF;

  -- Prevent joining if already in a competition
  IF EXISTS (
    SELECT 1 FROM competitions
    WHERE player1_id = auth.uid() OR player2_id = auth.uid()
  ) THEN
    RETURN json_build_object('error', 'You are already in a competition.');
  END IF;

  -- Add the caller as player2
  UPDATE competitions
  SET player2_id = auth.uid()
  WHERE id = v_invite.competition_id;

  -- Mark invite as accepted
  UPDATE invites
  SET status = 'accepted'
  WHERE id = v_invite.id;

  RETURN json_build_object('ok', true, 'competition_id', v_invite.competition_id);
END;
$$;
