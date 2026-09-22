-- The quote-drafting assistant's daily cap was checked per feature, but the
-- underlying free-tier API key is shared across every AI feature. With a
-- second feature (business reports) added, two independent per-feature caps
-- would let combined usage reach double the intended daily budget. This
-- keeps per-feature rows for observability but changes the function to
-- return the day's total across all features, so the cap is checked globally.

CREATE OR REPLACE FUNCTION public.increment_ai_usage_counter (
  p_feature text,
  p_day date
)
  RETURNS integer
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
    -- A data-modifying CTE and the query around it share one snapshot, so a
    -- plain re-read of the table here would not see the row this statement
    -- just wrote. RETURNING sidesteps that: it reflects this statement's own
    -- write directly, and only the OTHER features' rows are read normally.
    WITH upserted AS (
      INSERT INTO public.ai_usage_counters (day, feature, request_count)
      VALUES (p_day, p_feature, 1)
      ON CONFLICT (day, feature)
      DO UPDATE SET request_count = ai_usage_counters.request_count + 1
      RETURNING request_count
    ),
    other_features AS (
      SELECT coalesce(sum(request_count), 0) AS request_count
      FROM public.ai_usage_counters
      WHERE day = p_day AND feature <> p_feature
    )
    SELECT (upserted.request_count + other_features.request_count)::integer
    FROM upserted, other_features
$function$;

COMMENT ON FUNCTION "public"."increment_ai_usage_counter"(text, date) IS 'Increments one feature''s counter and returns the total request count across all AI features for that day, since the daily cap protects one shared API key.';
