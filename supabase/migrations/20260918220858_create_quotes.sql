CREATE TABLE "public"."glass_pieces" (
  "id"            bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "glass_type_id" bigint                   NOT NULL,
  "width_in"      numeric(6,2)             NOT NULL,
  "height_in"     numeric(6,2)             NOT NULL,
  "quantity"      integer                  NOT NULL,
  "origin"        text                     NOT NULL,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "glass_pieces_height_in_check" CHECK ((height_in > (0)::numeric)),
  CONSTRAINT "glass_pieces_origin_check" CHECK ((origin = ANY (ARRAY['shipment'::text, 'offcut'::text]))),
  CONSTRAINT "glass_pieces_pkey" PRIMARY KEY (id),
  CONSTRAINT "glass_pieces_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "glass_pieces_width_in_check" CHECK ((width_in > (0)::numeric))
);

ALTER TABLE "public"."glass_pieces"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."quote_line_items" (
  "id"               bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "quote_id"         bigint                   NOT NULL,
  "window_type_id"   bigint                   NOT NULL,
  "glass_type_id"    bigint                   NOT NULL,
  "width_in"         numeric(6,2)             NOT NULL,
  "height_in"        numeric(6,2)             NOT NULL,
  "quantity"         integer                  NOT NULL,
  "unit_price_cents" integer                  NOT NULL,
  "line_total_cents" integer                  NOT NULL,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "quote_line_items_height_in_check" CHECK ((height_in > (0)::numeric)),
  CONSTRAINT "quote_line_items_line_total_cents_check" CHECK ((line_total_cents >= 0)),
  CONSTRAINT "quote_line_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "quote_line_items_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "quote_line_items_unit_price_cents_check" CHECK ((unit_price_cents >= 0)),
  CONSTRAINT "quote_line_items_width_in_check" CHECK ((width_in > (0)::numeric))
);

ALTER TABLE "public"."quote_line_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."quotes" (
  "id"          bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "customer_id" bigint                   NOT NULL,
  "status"      text                     NOT NULL,
  "approved_at" timestamp with time zone,
  "declined_at" timestamp with time zone,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "quotes_check" CHECK ((((status = 'pending'::text) AND (approved_at IS NULL) AND (declined_at IS NULL)) OR ((status = 'approved'::text) AND (approved_at IS
    NOT NULL) AND (declined_at IS NULL)) OR ((status = 'declined'::text) AND (declined_at IS NOT NULL) AND (approved_at IS NULL)))),
  CONSTRAINT "quotes_pkey" PRIMARY KEY (id),
  CONSTRAINT "quotes_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'declined'::text])))
);

ALTER TABLE "public"."quotes"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."glass_pieces"
  ADD CONSTRAINT "glass_pieces_glass_type_id_fkey" FOREIGN KEY (glass_type_id) REFERENCES public.glass_types(id);

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_glass_type_id_fkey" FOREIGN KEY (glass_type_id) REFERENCES public.glass_types(id);

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_window_type_id_fkey" FOREIGN KEY (window_type_id) REFERENCES public.window_types(id);

ALTER TABLE "public"."quotes"
  ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE "public"."quote_line_items"
  ADD CONSTRAINT "quote_line_items_quote_id_fkey" FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

CREATE INDEX glass_pieces_glass_type_id_idx ON public.glass_pieces USING btree (glass_type_id);

CREATE INDEX quote_line_items_quote_id_idx ON public.quote_line_items USING btree (quote_id);

CREATE INDEX quotes_customer_id_idx ON public.quotes USING btree (customer_id);

CREATE TRIGGER glass_pieces_set_updated_at
  BEFORE UPDATE ON public.glass_pieces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER quotes_set_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE "public"."glass_pieces" IS 'Cuttable rectangles of glass stock: purchased sheets or leftover offcuts from previous cuts.';

COMMENT ON TABLE "public"."quote_line_items" IS 'Line items are priced and frozen at quote time; they are never edited in place.';

COMMENT ON TABLE "public"."quotes" IS 'A quote is pending, approved, or declined; declined quotes are kept forever and never fulfilled.';

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."glass_pieces" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."glass_pieces" TO "postgres", "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."quote_line_items" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quote_line_items" TO "postgres", "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."quotes" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."quotes" TO "postgres", "service_role";

