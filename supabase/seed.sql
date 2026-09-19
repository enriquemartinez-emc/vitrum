insert into public.customers (first_name, last_name, phone_number, address)
values
  ('Maria', 'Gonzalez', '(555) 214-7788', '482 Larkspur Ave, Riverton'),
  ('James', 'Whitfield', '(555) 309-4421', '17 Birchwood Ct, Riverton'),
  ('Aiko', 'Tanaka', '(555) 887-2156', null),
  ('Daniel', 'Okafor', '(555) 665-3390', '2210 Meadow Ridge Rd, Fairview'),
  ('Priya', 'Sharma', '(555) 442-8871', '96 Sunset Blvd, Fairview'),
  ('Lucas', 'Bennett', '(555) 771-0034', null),
  ('Hannah', 'Kowalski', '(555) 523-6647', '318 Pinecrest Dr, Riverton'),
  ('Marcus', 'Reyes', '(555) 198-4423', '75 Willow Creek Ln, Fairview');

insert into public.window_types (name, labor_cost_cents)
values
  ('Single Hung', 8500),
  ('Double Hung', 9500),
  ('Casement', 11000),
  ('Sliding', 9000),
  ('Picture', 7500),
  ('Awning', 10500),
  ('Bay', 18000);

insert into public.glass_types (name, price_per_sqft_cents)
values
  ('Single Pane', 600),
  ('Double Pane Insulated', 1400),
  ('Low-E Double Pane', 1900),
  ('Tempered Safety', 2200),
  ('Frosted Privacy', 1750),
  ('Triple Pane', 2600);

insert into public.glass_pieces (glass_type_id, width_in, height_in, quantity, origin)
values
  ((select id from public.glass_types where name = 'Single Pane'), 96, 130, 3, 'shipment'),
  ((select id from public.glass_types where name = 'Single Pane'), 24, 36, 2, 'offcut'),
  ((select id from public.glass_types where name = 'Double Pane Insulated'), 96, 130, 4, 'shipment'),
  ((select id from public.glass_types where name = 'Double Pane Insulated'), 30, 40, 1, 'offcut'),
  ((select id from public.glass_types where name = 'Low-E Double Pane'), 84, 120, 2, 'shipment'),
  ((select id from public.glass_types where name = 'Low-E Double Pane'), 24, 24, 3, 'offcut'),
  ((select id from public.glass_types where name = 'Tempered Safety'), 96, 130, 2, 'shipment'),
  ((select id from public.glass_types where name = 'Tempered Safety'), 36, 48, 2, 'offcut'),
  ((select id from public.glass_types where name = 'Tempered Safety'), 20, 30, 1, 'offcut'),
  ((select id from public.glass_types where name = 'Frosted Privacy'), 60, 84, 3, 'shipment'),
  ((select id from public.glass_types where name = 'Triple Pane'), 96, 130, 1, 'shipment');

with new_quote as (
  insert into public.quotes (customer_id, status)
  values (
    (select id from public.customers where first_name = 'Maria' and last_name = 'Gonzalez'),
    'pending'
  )
  returning id
)
insert into public.quote_line_items
  (quote_id, window_type_id, glass_type_id, width_in, height_in, quantity, unit_price_cents, line_total_cents)
select
  new_quote.id,
  (select id from public.window_types where name = v.window_type_name),
  (select id from public.glass_types where name = v.glass_type_name),
  v.width_in, v.height_in, v.quantity, v.unit_price_cents, v.line_total_cents
from new_quote,
  (values
    ('Double Hung', 'Low-E Double Pane', 24, 36, 2, 20900, 41800),
    ('Casement', 'Tempered Safety', 30, 40, 1, 29333, 29333)
  ) as v(window_type_name, glass_type_name, width_in, height_in, quantity, unit_price_cents, line_total_cents);

with new_quote as (
  insert into public.quotes (customer_id, status, approved_at)
  values (
    (select id from public.customers where first_name = 'James' and last_name = 'Whitfield'),
    'approved',
    '2026-09-10 14:00:00+00'
  )
  returning id
)
insert into public.quote_line_items
  (quote_id, window_type_id, glass_type_id, width_in, height_in, quantity, unit_price_cents, line_total_cents)
select
  new_quote.id,
  (select id from public.window_types where name = 'Sliding'),
  (select id from public.glass_types where name = 'Frosted Privacy'),
  36, 48, 3, 30000, 90000
from new_quote;

with new_quote as (
  insert into public.quotes (customer_id, status, declined_at)
  values (
    (select id from public.customers where first_name = 'Aiko' and last_name = 'Tanaka'),
    'declined',
    '2026-09-08 09:30:00+00'
  )
  returning id
)
insert into public.quote_line_items
  (quote_id, window_type_id, glass_type_id, width_in, height_in, quantity, unit_price_cents, line_total_cents)
select
  new_quote.id,
  (select id from public.window_types where name = 'Picture'),
  (select id from public.glass_types where name = 'Single Pane'),
  48, 60, 1, 19500, 19500
from new_quote;
