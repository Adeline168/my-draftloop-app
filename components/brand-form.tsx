"use client";

import { useState, useTransition } from "react";
import { saveBrandProfileAction } from "@/lib/actions/brand";
import type { BrandProfile } from "@/lib/types";
import { PLATFORMS } from "@/lib/types";

export function BrandForm({ brand }: { brand: BrandProfile | null }) {
  const [brandName, setBrandName] = useState(brand?.brand_name ?? "");
  const [voiceRules, setVoiceRules] = useState(brand?.voice_rules ?? "");
  const [icp, setIcp] = useState(brand?.icp_description ?? "");
  const [platform, setPlatform] = useState(brand?.platform ?? PLATFORMS[0]);
  const [guardrails, setGuardrails] = useState(brand?.guardrails ?? "");
  const [threshold, setThreshold] = useState(brand?.score_threshold ?? 70);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveBrandProfileAction({
        brand_name: brandName,
        voice_rules: voiceRules,
        icp_description: icp,
        platform,
        guardrails,
        score_threshold: threshold,
      });
      if (!result.ok) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Brand name</label>
        <input
          required
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Voice / tone rules</label>
        <textarea
          value={voiceRules}
          onChange={(e) => setVoiceRules(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">ICP description</label>
        <textarea
          value={icp}
          onChange={(e) => setIcp(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Score threshold (0-70)</label>
          <input
            type="number"
            min={0}
            max={70}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Guardrails</label>
        <textarea
          value={guardrails}
          onChange={(e) => setGuardrails(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save brand profile"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
    </form>
  );
}
