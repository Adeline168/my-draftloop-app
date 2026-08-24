import { createClient } from "@/lib/supabase/server";
import type { ContentPillar } from "@/lib/types";

export async function listContentPillars(brandProfileId: string): Promise<ContentPillar[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pillars")
    .select("*")
    .eq("brand_profile_id", brandProfileId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load content pillars: ${error.message}`);
  return (data ?? []) as ContentPillar[];
}

export interface ContentPillarInput {
  brand_profile_id: string;
  name: string;
  description: string;
}

export async function createContentPillar(input: ContentPillarInput): Promise<ContentPillar> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pillars")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create content pillar: ${error.message}`);
  return data as ContentPillar;
}

export async function updateContentPillar(
  id: string,
  input: Partial<Pick<ContentPillarInput, "name" | "description">>,
): Promise<ContentPillar> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pillars")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update content pillar: ${error.message}`);
  return data as ContentPillar;
}

export async function deleteContentPillar(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("content_pillars").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete content pillar: ${error.message}`);
}
