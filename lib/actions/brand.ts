"use server";

import { revalidatePath } from "next/cache";
import {
  createBrandProfile,
  getActiveBrandProfile,
  updateBrandProfile,
  type BrandProfileInput,
} from "@/lib/data/brand-profiles";
import {
  createContentPillar,
  deleteContentPillar,
  updateContentPillar,
} from "@/lib/data/content-pillars";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function saveBrandProfileAction(
  input: BrandProfileInput,
): Promise<ActionResult> {
  try {
    const existing = await getActiveBrandProfile();
    if (existing) {
      await updateBrandProfile(existing.id, input);
    } else {
      await createBrandProfile(input);
    }
    revalidatePath("/brand");
    revalidatePath("/");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save brand profile" };
  }
}

export async function createPillarAction(input: {
  brand_profile_id: string;
  name: string;
  description: string;
}): Promise<ActionResult> {
  try {
    if (!input.name.trim()) return { ok: false, error: "Pillar name is required" };
    await createContentPillar(input);
    revalidatePath("/brand");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create pillar" };
  }
}

export async function updatePillarAction(
  id: string,
  input: { name: string; description: string },
): Promise<ActionResult> {
  try {
    await updateContentPillar(id, input);
    revalidatePath("/brand");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update pillar" };
  }
}

export async function deletePillarAction(id: string): Promise<ActionResult> {
  try {
    await deleteContentPillar(id);
    revalidatePath("/brand");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete pillar" };
  }
}
