import { createClient } from "@/lib/supabase/server";
import type { Draft, DraftStatus } from "@/lib/types";

export async function listDrafts(): Promise<Draft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load drafts: ${error.message}`);
  return (data ?? []) as Draft[];
}

export async function listDraftsWithDates(): Promise<Draft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .or("scheduled_date.not.is.null,published_date.not.is.null")
    .order("scheduled_date", { ascending: true });

  if (error) throw new Error(`Failed to load calendar drafts: ${error.message}`);
  return (data ?? []) as Draft[];
}

export async function getDraftById(id: string): Promise<Draft | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drafts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to load draft: ${error.message}`);
  return data as Draft | null;
}

export async function getDraftsByIdeaId(ideaId: string): Promise<Draft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load drafts for idea: ${error.message}`);
  return (data ?? []) as Draft[];
}

export interface CreateDraftInput {
  idea_id: string;
  platform: string;
  body_text: string;
  framework_name?: string | null;
  framework_source?: string | null;
  framework_confidence?: number | null;
  framework_justification?: string | null;
  pain_driver?: string | null;
  pain_source?: string | null;
  pain_confidence?: number | null;
  status?: DraftStatus;
}

export async function createDraft(input: CreateDraftInput): Promise<Draft> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .insert(input)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create draft: ${error.message}`);
  return data as Draft;
}

export interface UpdateDraftInput {
  body_text?: string;
  status?: DraftStatus;
  scheduled_date?: string | null;
  published_date?: string | null;
  framework_name?: string | null;
  framework_justification?: string | null;
  pain_driver?: string | null;
}

export async function updateDraft(id: string, input: UpdateDraftInput): Promise<Draft> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update draft: ${error.message}`);
  return data as Draft;
}

export async function deleteDraft(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("drafts").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete draft: ${error.message}`);
}
