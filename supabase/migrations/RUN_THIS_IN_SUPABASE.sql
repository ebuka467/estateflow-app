-- RUN THIS IN SUPABASE SQL EDITOR to fix tenant customization sync
-- This updates find_estate_by_join_code to return all customization columns

CREATE OR REPLACE FUNCTION public.find_estate_by_join_code(p_join_code TEXT)
RETURNS TABLE (
  estate_id UUID,
  estate_name TEXT,
  manager_email TEXT,
  monthly_dues INTEGER,
  estate_bank TEXT,
  estate_account_name TEXT,
  primary_color TEXT,
  font_family TEXT,
  theme_id TEXT,
  layout_id TEXT,
  background_type TEXT,
  gradient_angle INTEGER,
  gradient_color1 TEXT,
  gradient_color2 TEXT,
  bg_image_url TEXT,
  enable_3d BOOLEAN,
  solid_bg_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, e.name, e.manager_email, e.monthly_dues, e.estate_bank, e.estate_account_name,
    e.primary_color, e.font_family, e.theme_id, e.layout_id,
    e.background_type, e.gradient_angle, e.gradient_color1, e.gradient_color2,
    e.bg_image_url, e.enable_3d, e.solid_bg_color
  FROM public.estates e
  WHERE UPPER(e.join_code) = UPPER(p_join_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.find_estate_by_join_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_estate_by_join_code(TEXT) TO anon;

-- Also add solid_bg_color column if missing
ALTER TABLE public.estates ADD COLUMN IF NOT EXISTS solid_bg_color TEXT;
