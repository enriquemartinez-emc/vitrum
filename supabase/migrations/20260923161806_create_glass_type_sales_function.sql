CREATE OR REPLACE FUNCTION public.get_glass_type_sales_by_day (
  p_from date,
  p_to   date
)
  RETURNS TABLE (
    sale_date       date,
    glass_type_name text,
    total_cents     bigint
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    SELECT
      q.approved_at::date AS sale_date,
      gt.name AS glass_type_name,
      sum(qli.line_total_cents)::bigint AS total_cents
    FROM public.quote_line_items qli
    JOIN public.quotes q ON q.id = qli.quote_id
    JOIN public.glass_types gt ON gt.id = qli.glass_type_id
    WHERE q.status = 'approved'
      AND q.approved_at::date BETWEEN p_from AND p_to
    GROUP BY q.approved_at::date, gt.name
    ORDER BY sale_date, gt.name
$function$;

COMMENT ON FUNCTION "public"."get_glass_type_sales_by_day"(date, date) IS 'Revenue per glass type per day, from approved quotes, within a date range.';

REVOKE ALL ON FUNCTION "public"."get_glass_type_sales_by_day"(date, date) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_glass_type_sales_by_day"(date, date) TO "postgres", "service_role";
