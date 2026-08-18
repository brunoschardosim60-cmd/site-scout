CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id TEXT,
  name TEXT NOT NULL,
  legal_name TEXT,
  cnpj TEXT,
  situacao_cadastral TEXT,
  owner_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  district TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  rating NUMERIC,
  reviews INTEGER,
  maps_url TEXT,
  photo_url TEXT,
  segment TEXT,
  status TEXT NOT NULL DEFAULT 'nao_contatado',
  site_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  score INTEGER,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT empresas_user_place_unique UNIQUE (user_id, place_id)
);

CREATE INDEX empresas_user_idx ON public.empresas (user_id);
CREATE INDEX empresas_city_idx ON public.empresas (user_id, city);
CREATE INDEX empresas_segment_idx ON public.empresas (user_id, segment);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT ALL ON public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam suas empresas" ON public.empresas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  note TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX followups_user_idx ON public.followups (user_id, due_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.followups TO authenticated;
GRANT ALL ON public.followups TO service_role;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam seus followups" ON public.followups FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT,
  title TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX atividades_empresa_idx ON public.atividades (user_id, empresa_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atividades TO authenticated;
GRANT ALL ON public.atividades TO service_role;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam suas atividades" ON public.atividades FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.configuracoes (
  user_id UUID NOT NULL PRIMARY KEY,
  seller_name TEXT NOT NULL DEFAULT '',
  nexa_url TEXT NOT NULL DEFAULT 'https://nexa-xi-puce.vercel.app/painel/novo',
  templates JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios gerenciam suas configuracoes" ON public.configuracoes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON public.followups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();