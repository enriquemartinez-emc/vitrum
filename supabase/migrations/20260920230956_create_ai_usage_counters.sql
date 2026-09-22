SET local check_function_bodies = off;

CREATE TABLE "public"."ai_usage_counters" (
  "day"           date    NOT NULL,
  "feature"       text    NOT NULL,
  "request_count" integer NOT NULL DEFAULT 0,
  CONSTRAINT "ai_usage_counters_pkey" PRIMARY KEY (day, feature)
);

ALTER TABLE "public"."ai_usage_counters"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_ai_usage_counter (
  p_feature text,
  p_day     date
)
  RETURNS integer
  LANGUAGE sql
  SET search_path TO ''
  AS $function$
    INSERT INTO public.ai_usage_counters (day, feature, request_count)
    VALUES (p_day, p_feature, 1)
    ON CONFLICT (day, feature)
    DO UPDATE SET request_count = ai_usage_counters.request_count + 1
    RETURNING request_count;
$function$;

COMMENT ON TABLE "public"."ai_usage_counters" IS 'Per-day request counters used to cap AI feature usage against free-tier provider limits.';

REVOKE ALL ON FUNCTION "public"."increment_ai_usage_counter"(text, date) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."increment_ai_usage_counter"(text, date) TO "postgres", "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."ai_usage_counters" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ai_usage_counters" TO "postgres", "service_role";

