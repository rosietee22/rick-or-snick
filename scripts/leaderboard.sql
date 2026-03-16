-- ============================================================
-- Global leaderboard function — run once in Supabase SQL editor
-- ============================================================
-- Returns first names + this week's points for all active players.
-- Callable by unauthenticated (anon) users — no personal data exposed.

CREATE OR REPLACE FUNCTION get_global_leaderboard()
RETURNS TABLE (first_name text, points integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  week_start date;
BEGIN
  -- Monday of the current ISO week
  week_start := date_trunc('week', now())::date;

  RETURN QUERY
  WITH workout_pts AS (
    SELECT w.person::uuid AS user_id, COUNT(*)::integer AS pts
    FROM workouts w
    WHERE w.date::date >= week_start
      AND w.type != 'steps'
      AND w.competition_id IS NOT NULL
      AND w.person ~ '^[0-9a-f]{8}-[0-9a-f]{4}-'
    GROUP BY w.person
  ),
  step_pts AS (
    SELECT s.user_id, SUM(FLOOR(s.steps::numeric / 10000))::integer AS pts
    FROM steps s
    WHERE s.date >= week_start
    GROUP BY s.user_id
  ),
  combined AS (
    SELECT
      COALESCE(wp.user_id, sp.user_id) AS user_id,
      COALESCE(wp.pts, 0) + COALESCE(sp.pts, 0) AS total_pts
    FROM workout_pts wp
    FULL OUTER JOIN step_pts sp ON wp.user_id = sp.user_id
  )
  SELECT
    split_part(p.display_name, ' ', 1) AS first_name,
    c.total_pts AS points
  FROM combined c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.total_pts > 0
  ORDER BY c.total_pts DESC
  LIMIT 20;
END;
$$;

GRANT EXECUTE ON FUNCTION get_global_leaderboard() TO anon;
GRANT EXECUTE ON FUNCTION get_global_leaderboard() TO authenticated;
