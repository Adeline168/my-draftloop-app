import { createClient } from "@/lib/supabase/server";
import type { BrandFile, BrandFileSection, ExtractionStatus } from "@/lib/types";

const BUCKET = "brand-files";

export async function listBrandFiles(brandProfileId: string): Promise<BrandFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_files")
    .select("*")
    .eq("brand_profile_id", brandProfileId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load brand files: ${error.message}`);
  return (data ?? []) as BrandFile[];
}

// Every file whose text was successfully extracted, for a set of sections —
// used to build the AI generation prompt.
export async function listExtractedTextBySection(
  brandProfileId: string,
): Promise<Record<BrandFileSection, { file_name: string; extracted_text: string }[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_files")
    .select("section, file_name, extracted_text")
    .eq("brand_profile_id", brandProfileId)
    .eq("extraction_status", "done");

  if (error) throw new Error(`Failed to load brand file text: ${error.message}`);

  const bySection: Record<string, { file_name: string; extracted_text: string }[]> = {
    business_identity: [],
    objections: [],
    founder_story: [],
  };
  for (const row of data ?? []) {
    if (!row.extracted_text) continue;
    bySection[row.section]?.push({ file_name: row.file_name, extracted_text: row.extracted_text });
  }
  return bySection as Record<BrandFileSection, { file_name: string; extracted_text: string }[]>;
}

export interface CreateBrandFileInput {
  brand_profile_id: string;
  section: BrandFileSection;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number;
  extracted_text: string | null;
  extraction_status: ExtractionStatus;
}

export async function createBrandFileRecord(input: CreateBrandFileInput): Promise<BrandFile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_files")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to save file record: ${error.message}`);
  return data as BrandFile;
}

export async function uploadBrandFileBytes(
  storagePath: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Failed to upload file: ${error.message}`);
}

export async function getBrandFilePublicUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteBrandFile(id: string, storagePath: string): Promise<void> {
  const supabase = await createClient();
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (storageError) throw new Error(`Failed to delete file from storage: ${storageError.message}`);

  const { error } = await supabase.from("brand_files").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete file record: ${error.message}`);
}
