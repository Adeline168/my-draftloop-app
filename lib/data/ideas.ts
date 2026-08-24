import { createClient } from "@/lib/supabase/server";
import type { Idea, IdeaStatus } from "@/lib/types";

export async function listIdeas(): Promise<Idea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load ideas: ${error.message}`);
  return (data ?? []) as Idea[];
}

export async function getIdeaById(id: string): Promise<Idea | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ideas").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to load idea: ${error.message}`);
  return data as Idea | null;
}

export interface IdeaInput {
  raw_topic: string;
  half_formed_hook?: string | null;
  pillar_id?: string | null;
}

export async function createIdea(input: IdeaInput): Promise<Idea> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({ ...input, status: "idea" })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create idea: ${error.message}`);
  return data as Idea;
}

export async function updateIdea(
  id: string,
  input: Partial<IdeaInput> & { status?: IdeaStatus },
): Promise<Idea> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to update idea: ${error.message}`);
  return data as Idea;
}

export async function deleteIdea(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete idea: ${error.message}`);
}
