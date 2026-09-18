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
