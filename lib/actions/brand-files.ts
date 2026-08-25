"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import {
  createBrandFileRecord,
  deleteBrandFile,
  uploadBrandFileBytes,
} from "@/lib/data/brand-files";
import { extractText } from "@/lib/files/extract-text";
import type { ActionResult } from "@/lib/actions/brand";
import type { BrandFileSection } from "@/lib/types";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function uploadBrandFileAction(formData: FormData): Promise<ActionResult> {
  try {
    const file = formData.get("file");
    const brandProfileId = formData.get("brandProfileId");
    const section = formData.get("section");

    if (!(file instanceof File)) return { ok: false, error: "No file provided" };
    if (typeof brandProfileId !== "string" || !brandProfileId) {
      return { ok: false, error: "Missing brand profile" };
    }
    if (typeof section !== "string") return { ok: false, error: "Missing section" };
    if (file.size === 0) return { ok: false, error: "File is empty" };
    if (file.size > MAX_FILE_SIZE) return { ok: false, error: "File is larger than 15MB" };

    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = `${brandProfileId}/${section}/${randomUUID()}-${file.name}`;

    await uploadBrandFileBytes(storagePath, bytes, file.type || "application/octet-stream");

    const { text, status } = await extractText(bytes, file.name, file.type || null);

    await createBrandFileRecord({
      brand_profile_id: brandProfileId,
      section: section as BrandFileSection,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      extracted_text: text,
      extraction_status: status,
    });

    revalidatePath("/brand");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to upload file" };
  }
}

export async function deleteBrandFileAction(id: string, storagePath: string): Promise<ActionResult> {
  try {
    await deleteBrandFile(id, storagePath);
    revalidatePath("/brand");
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete file" };
  }
}
