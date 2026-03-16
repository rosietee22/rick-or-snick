-- ============================================================
-- Heated Rivalry v2 — One-time data migration
--
-- Run this AFTER:
--   1. schema.sql has been applied
--   2. Phoebe (phoebeckerr@gmail.com) has signed in at least once
--   3. Rosie  (rosiethomasemail@gmail.com) has signed in at least once
--
-- How to find a user's ID:
--   Supabase dashboard → Authentication → Users → click user → copy UUID
--
-- Fill in the two UUIDs below, then run the whole file in the SQL editor.
-- It is safe to run more than once (uses ON CONFLICT DO NOTHING / idempotent updates).
-- ============================================================

-- ── Step 1: Set your user IDs here ────────────────────────────

DO $$
DECLARE
  phoebe_id  uuid := '00000000-0000-0000-0000-000000000001'; -- REPLACE with Phoebe's auth user ID
  rosie_id   uuid := '00000000-0000-0000-0000-000000000002'; -- REPLACE with Rosie's auth user ID
  comp_id    uuid;
BEGIN

  -- ── Step 2: Ensure profiles exist for both users ─────────────
  -- (The trigger normally handles this, but belt-and-braces for existing accounts)
  INSERT INTO profiles (id, display_name)
    SELECT id, raw_user_meta_data->>'full_name'
    FROM auth.users
    WHERE id IN (phoebe_id, rosie_id)
  ON CONFLICT (id) DO NOTHING;

  -- ── Step 3: Create the Phoebe / Rosie competition ─────────────
  INSERT INTO competitions (name, created_by, player1_id, player2_id)
  VALUES ('Heated Rivalry', phoebe_id, phoebe_id, rosie_id)
  ON CONFLICT DO NOTHING
  RETURNING id INTO comp_id;

  -- If competition already existed, look it up
  IF comp_id IS NULL THEN
    SELECT id INTO comp_id
    FROM competitions
    WHERE player1_id = phoebe_id AND player2_id = rosie_id
    LIMIT 1;
  END IF;

  -- ── Step 4: Update workouts — remap person IDs and set competition ──
  UPDATE workouts
  SET
    person         = phoebe_id::text,
    user_id        = phoebe_id,
    competition_id = comp_id
  WHERE person = 'person1'
    AND type != 'steps';

  UPDATE workouts
  SET
    person         = rosie_id::text,
    user_id        = rosie_id,
    competition_id = comp_id
  WHERE person = 'person2'
    AND type != 'steps';

  -- ── Step 5: Migrate step rows from workouts → steps table ─────

  -- Phoebe's steps
  INSERT INTO steps (user_id, competition_id, date, steps)
  SELECT
    phoebe_id,
    comp_id,
    date::date,
    workouts.steps
  FROM workouts
  WHERE person = 'person1'
    AND type = 'steps'
    AND workouts.steps IS NOT NULL
  ON CONFLICT (user_id, date) DO UPDATE SET steps = EXCLUDED.steps;

  -- Rosie's steps
  INSERT INTO steps (user_id, competition_id, date, steps)
  SELECT
    rosie_id,
    comp_id,
    date::date,
    workouts.steps
  FROM workouts
  WHERE person = 'person2'
    AND type = 'steps'
    AND workouts.steps IS NOT NULL
  ON CONFLICT (user_id, date) DO UPDATE SET steps = EXCLUDED.steps;

  -- ── Step 6: Remove migrated step rows from workouts ───────────
  DELETE FROM workouts WHERE type = 'steps';

  RAISE NOTICE 'Migration complete. Competition ID: %', comp_id;
END;
$$;
