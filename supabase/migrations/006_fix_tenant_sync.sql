-- Fix find_estate_by_join_code to return customization columns
-- so tenants inherit manager's design

CREATE OR REPLACE FUNCTION public.find_estate_by_join_code(p_join_code TEXT)
RETURNS TABLE (
  estate_id UUID,
  estate_name TEXT,
  manager_email TEXT,
  monthly_dues INTEGER,
  estate_bank TEXT,
  estate_account_name TEXT,
  -- Customization columns for tenant inheritance
  primary_color TEXT,
  font_family TEXT,
  theme_id TEXT,
  layout_id TEXT,
  background_type TEXT,
  gradient_angle INTEGER,
  gradient_color1 TEXT,
  gradient_color2 TEXT,
  bg_image_url TEXT,
  enable_3d BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.manager_email,
    e.monthly_dues,
    e.estate_bank,
    e.estate_account_name,
    -- Customization
    e.primary_color,
    e.font_family,
    e.theme_id,
    e.layout_id,
    e.background_type,
    e.gradient_angle,
    e.gradient_color1,
    e.gradient_color2,
    e.bg_image_url,
    e.enable_3d
  FROM public.estates e
  WHERE UPPER(e.join_code) = UPPER(p_join_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.find_estate_by_join_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_estate_by_join_code(TEXT) TO anon;
