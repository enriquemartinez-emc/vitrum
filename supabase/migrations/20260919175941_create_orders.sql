SET local check_function_bodies = off;

CREATE TABLE "public"."orders" (
  "id"                bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "quote_id"          bigint                   NOT NULL,
  "installation_date" date                     NOT NULL,
  "status"            text                     NOT NULL,
  "completed_at"      timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "orders_check" CHECK ((((status = 'scheduled'::text) AND (completed_at IS NULL)) OR ((status = 'complete'::text) AND (completed_at IS NOT NULL)))),
  CONSTRAINT "orders_pkey" PRIMARY KEY (id),
  CONSTRAINT "orders_quote_id_key" UNIQUE (quote_id),
  CONSTRAINT "orders_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'complete'::text])))
);

ALTER TABLE "public"."orders"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_order_from_quote (
  payload jsonb
)
  RETURNS bigint
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare
  new_order_id bigint;
  decrement jsonb;
  new_piece jsonb;
begin
  insert into public.orders (quote_id, installation_date, status)
  values (
    (payload->>'quote_id')::bigint,
    (payload->>'installation_date')::date,
    'scheduled'
  )
  returning id into new_order_id;

  for decrement in select * from jsonb_array_elements(payload->'decrements')
  loop
    with target as (
      select id, quantity - (decrement->>'amount')::integer as new_quantity
      from public.glass_pieces
      where id = (decrement->>'piece_id')::bigint
    ),
    removed as (
      delete from public.glass_pieces
      where id in (select id from target where new_quantity <= 0)
      returning id
    )
    update public.glass_pieces
    set quantity = (select target.new_quantity from target where target.id = glass_pieces.id)
    where id in (select id from target where new_quantity > 0);
  end loop;

  for new_piece in select * from jsonb_array_elements(payload->'new_pieces')
  loop
    insert into public.glass_pieces (glass_type_id, width_in, height_in, quantity, origin)
    values (
      (new_piece->>'glass_type_id')::bigint,
      (new_piece->>'width_in')::numeric,
      (new_piece->>'height_in')::numeric,
      (new_piece->>'quantity')::integer,
      'offcut'
    );
  end loop;

  return new_order_id;
end;
$function$;

ALTER TABLE "public"."orders"
  ADD CONSTRAINT "orders_quote_id_fkey" FOREIGN KEY (quote_id) REFERENCES public.quotes(id);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE "public"."orders" IS 'An order exists only for an approved quote (quote_id is unique) and is scheduled or complete.';

REVOKE ALL ON FUNCTION "public"."create_order_from_quote"(jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."create_order_from_quote"(jsonb) TO "postgres", "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."orders" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."orders" TO "postgres", "service_role";

