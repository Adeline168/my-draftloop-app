import { createClient } from "@/lib/supabase/server";
import type { BrandProfile } from "@/lib/types";

// v1: single active brand profile (multi-brand is v2). We always operate on
// the most recently created row so the app works without auth.
export async function getActiveBrandProfile(): Promise<BrandProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load brand profile: ${error.message}`);
  return data as BrandProfile | null;
}

export async function getBrandProfileById(id: string): Promise<BrandProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load brand profile: ${error.message}`);
  return data as BrandProfile | null;
}

export interface BrandProfileInput {
  brand_name: string;
  voice_rules: string;
  icp_description: string;
  platform: string;
  guardrails: string;
  score_threshold: number;
}

export async function createBrandProfile(input: BrandProfileInput): Promise<BrandProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create brand profile: ${error.message}`);
  return data as BrandProfile;
}

export async function updateBrandProfile(
  id: string,
  input: Partial<BrandProfileInput>,
): Promise<BrandProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_profiles")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update brand profile: ${error.message}`);
  return data as BrandProfile;
}
