"use client";

import { useRef, useState, useTransition } from "react";
import { updateBrandDetailAction } from "@/lib/actions/brand";
import { deleteBrandFileAction, uploadBrandFileAction } from "@/lib/actions/brand-files";
import type { BrandFile, BrandFileSection } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Processing…",
  done: "Attached",
  failed: "Couldn't read this file",
  unsupported: "Attached (not readable by AI — try .txt/.md/.pdf/.docx)",
};

const DETAIL_FIELD: Record<BrandFileSection, "business_identity" | "objections_notes" | "founder_story"> = {
  business_identity: "business_identity",
  objections: "objections_notes",
  founder_story: "founder_story",
};

export function BrandDetailSection({
  brandId,
  section,
  label,
  helper,
  initialValue,
  files,
}: {
  brandId: string;
  section: BrandFileSection;
  label: string;
  helper: string;
  initialValue: string;
  files: (BrandFile & { publicUrl: string })[];
}) {
  const [value, setValue] = useState(initialValue);
  const [dirty, setDirty] = useState(false);
  const [savePending, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [uploadPending, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    setError(null);
    startSave(async () => {
      const result = await updateBrandDetailAction(brandId, DETAIL_FIELD[section], value);
      if (!result.ok) setError(result.error);
      else {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("brandProfileId", brandId);
    formData.set("section", section);
    startUpload(async () => {
      const result = await uploadBrandFileAction(formData);
      if (!result.ok) setError(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleDelete(file: BrandFile) {
    if (!confirm(`Delete ${file.file_name}?`)) return;
    startUpload(async () => {
      await deleteBrandFileAction(file.id, file.storage_path);
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <h2 className="font-semibold">{label}</h2>
        <p className="text-xs text-neutral-500">{helper}</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
          setSaved(false);
        }}
        rows={3}
        placeholder={`Quick notes on ${label.toLowerCase()} (optional if you're attaching a file below)`}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={savePending || !dirty}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {savePending ? "Saving…" : "Save notes"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
      </div>

      <div className="border-t border-neutral-100 pt-3">
        {files.length > 0 && (
          <ul className="mb-3 space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2"
              >
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                >
                  {file.file_name}
                </a>
                <span
                  className={`shrink-0 text-xs ${file.extraction_status === "done" ? "text-emerald-600" : file.extraction_status === "failed" ? "text-red-600" : "text-neutral-500"}`}
                >
                  {STATUS_LABEL[file.extraction_status]}
                </span>
                <button
                  onClick={() => handleDelete(file)}
                  disabled={uploadPending}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-900">
          {uploadPending ? "Uploading…" : "+ Attach a file (.txt, .md, .pdf, .docx)"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.docx"
            onChange={handleFileChange}
            disabled={uploadPending}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
