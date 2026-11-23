CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cat insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cat update" ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cat delete" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  promo_price numeric(10,2),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prod read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "prod insert" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "prod update" ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prod delete" ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "img read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "img insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "img update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "img delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

INSERT INTO public.categories (id, name, display_order) VALUES
 ('11111111-0000-0000-0000-000000000001','Brincos',1),
 ('11111111-0000-0000-0000-000000000002','Colares',2),
 ('11111111-0000-0000-0000-000000000003','Anéis',3),
 ('11111111-0000-0000-0000-000000000004','Pulseiras',4),
 ('11111111-0000-0000-0000-000000000005','Conjuntos',5);

INSERT INTO public.products (name, description, price, promo_price, category_id, image_url, in_stock, featured) VALUES
 ('Brinco Argola Dourada','Argola média banhada a ouro 18k, leve e confortável para o dia a dia.',49.90,NULL,'11111111-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80',true,true),
 ('Colar Ponto de Luz','Corrente delicada com zircônia cravejada. Banho de ouro 18k.',79.90,64.90,'11111111-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80',true,false),
 ('Anel Solitário','Anel solitário com pedra cristal, ajustável.',59.90,NULL,'11111111-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80',true,true),
 ('Pulseira Elos Dourados','Pulseira de elos portugueses banhada a ouro.',69.90,NULL,'11111111-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80',false,false),
 ('Conjunto Pérolas','Colar e brincos de pérolas sintéticas com fecho dourado.',129.90,109.90,'11111111-0000-0000-0000-000000000005','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80',true,true),
 ('Colar Corrente Grumet','Corrente grumet encorpada, tendência da estação.',89.90,NULL,'11111111-0000-0000-0000-000000000002','https://images.unsplash.com/photo-1630019852942-f89202989a59?w=900&q=80',true,false);