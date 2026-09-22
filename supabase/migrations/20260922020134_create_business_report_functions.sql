-- Read-only aggregate functions backing the AI business-reporting assistant.
-- Every parameter is a plain typed value (date/integer), never interpolated
-- SQL, so there is no injection surface even though an LLM tool call chooses
-- the argument values.

CREATE INDEX quote_line_items_glass_type_id_idx ON public.quote_line_items USING btree (glass_type_id);

CREATE INDEX quotes_status_idx ON public.quotes USING btree (status);

CREATE INDEX quotes_approved_at_idx ON public.quotes USING btree (approved_at) WHERE (status = 'approved'::text);

CREATE INDEX orders_status_idx ON public.orders USING btree (status);

CREATE OR REPLACE FUNCTION public.get_revenue_summary (
  p_from date,
  p_to   date
)
  RETURNS TABLE (
    quote_count         bigint,
    total_cents         bigint,
    average_quote_cents numeric
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    WITH approved_quotes AS (
      SELECT q.id, sum(qli.line_total_cents) AS total_cents
      FROM public.quotes q
      JOIN public.quote_line_items qli ON qli.quote_id = q.id
      WHERE q.status = 'approved'
        AND q.approved_at::date BETWEEN p_from AND p_to
      GROUP BY q.id
    )
    SELECT
      count(*)::bigint AS quote_count,
      coalesce(sum(total_cents), 0)::bigint AS total_cents,
      coalesce(avg(total_cents), 0) AS average_quote_cents
    FROM approved_quotes
$function$;

CREATE OR REPLACE FUNCTION public.get_order_status_summary (
  p_as_of date DEFAULT current_date
)
  RETURNS TABLE (
    scheduled_count bigint,
    overdue_count   bigint,
    complete_count  bigint
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    SELECT
      count(*) FILTER (WHERE status = 'scheduled')::bigint AS scheduled_count,
      count(*) FILTER (WHERE status = 'scheduled' AND installation_date < p_as_of)::bigint AS overdue_count,
      count(*) FILTER (WHERE status = 'complete')::bigint AS complete_count
    FROM public.orders
$function$;

CREATE OR REPLACE FUNCTION public.get_glass_type_demand (
  p_from  date,
  p_to    date,
  p_limit integer DEFAULT 5
)
  RETURNS TABLE (
    glass_type_name text,
    total_quantity  bigint,
    total_sqft      numeric
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    SELECT
      gt.name AS glass_type_name,
      sum(qli.quantity)::bigint AS total_quantity,
      sum(qli.quantity * qli.width_in * qli.height_in / 144.0) AS total_sqft
    FROM public.quote_line_items qli
    JOIN public.quotes q ON q.id = qli.quote_id
    JOIN public.glass_types gt ON gt.id = qli.glass_type_id
    WHERE q.created_at::date BETWEEN p_from AND p_to
    GROUP BY gt.name
    ORDER BY total_quantity DESC
    LIMIT greatest(p_limit, 1)
$function$;

CREATE OR REPLACE FUNCTION public.get_quote_conversion_summary (
  p_from date,
  p_to   date
)
  RETURNS TABLE (
    pending_count  bigint,
    approved_count bigint,
    declined_count bigint,
    approval_rate  numeric
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    WITH counted AS (
      SELECT
        count(*) FILTER (WHERE status = 'pending')::bigint AS pending_count,
        count(*) FILTER (WHERE status = 'approved')::bigint AS approved_count,
        count(*) FILTER (WHERE status = 'declined')::bigint AS declined_count
      FROM public.quotes
      WHERE created_at::date BETWEEN p_from AND p_to
    )
    SELECT
      pending_count,
      approved_count,
      declined_count,
      CASE
        WHEN (approved_count + declined_count) = 0 THEN 0
        ELSE round(approved_count::numeric / (approved_count + declined_count), 4)
      END AS approval_rate
    FROM counted
$function$;

CREATE OR REPLACE FUNCTION public.get_top_customers_by_revenue (
  p_from  date,
  p_to    date,
  p_limit integer DEFAULT 5
)
  RETURNS TABLE (
    customer_id   bigint,
    customer_name text,
    total_cents   bigint,
    quote_count   bigint
  )
  LANGUAGE sql
  SECURITY INVOKER
  SET search_path TO ''
  AS $function$
    SELECT
      c.id AS customer_id,
      c.first_name || ' ' || c.last_name AS customer_name,
      sum(qli.line_total_cents)::bigint AS total_cents,
      count(DISTINCT q.id)::bigint AS quote_count
    FROM public.quotes q
    JOIN public.quote_line_items qli ON qli.quote_id = q.id
    JOIN public.customers c ON c.id = q.customer_id
    WHERE q.status = 'approved'
      AND q.approved_at::date BETWEEN p_from AND p_to
    GROUP BY c.id, c.first_name, c.last_name
    ORDER BY total_cents DESC
    LIMIT greatest(p_limit, 1)
$function$;

COMMENT ON FUNCTION "public"."get_revenue_summary"(date, date) IS 'Total, count, and average of approved quotes by approved_at date.';
COMMENT ON FUNCTION "public"."get_order_status_summary"(date) IS 'Scheduled/overdue/complete order counts as of a given date.';
COMMENT ON FUNCTION "public"."get_glass_type_demand"(date, date, integer) IS 'Top glass types by quoted quantity and area within a date range, by quote created_at.';
COMMENT ON FUNCTION "public"."get_quote_conversion_summary"(date, date) IS 'Pending/approved/declined quote counts and approval rate within a date range, by quote created_at.';
COMMENT ON FUNCTION "public"."get_top_customers_by_revenue"(date, date, integer) IS 'Top customers by approved quote revenue within a date range.';

REVOKE ALL ON FUNCTION "public"."get_revenue_summary"(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_order_status_summary"(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_glass_type_demand"(date, date, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_quote_conversion_summary"(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."get_top_customers_by_revenue"(date, date, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."get_revenue_summary"(date, date) TO "postgres", "service_role";
GRANT EXECUTE ON FUNCTION "public"."get_order_status_summary"(date) TO "postgres", "service_role";
GRANT EXECUTE ON FUNCTION "public"."get_glass_type_demand"(date, date, integer) TO "postgres", "service_role";
GRANT EXECUTE ON FUNCTION "public"."get_quote_conversion_summary"(date, date) TO "postgres", "service_role";
GRANT EXECUTE ON FUNCTION "public"."get_top_customers_by_revenue"(date, date, integer) TO "postgres", "service_role";
