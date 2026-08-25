import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listContentPillars } from "@/lib/data/content-pillars";
import { getBrandFilePublicUrl, listBrandFiles } from "@/lib/data/brand-files";
import { BrandForm } from "@/components/brand-form";
import { PillarsSection } from "@/components/pillars-section";
import { BrandDetailSection } from "@/components/brand-detail-section";
import { BRAND_FILE_SECTIONS } from "@/lib/types";
import type { BrandFile } from "@/lib/types";

export default async function BrandPage() {
  let brand = null as Awaited<ReturnType<typeof getActiveBrandProfile>> | null;
  let pillars: Awaited<ReturnType<typeof listContentPillars>> = [];
  let files: (BrandFile & { publicUrl: string })[] = [];
  let loadError: string | null = null;

  try {
    brand = await getActiveBrandProfile();
    if (brand) {
      pillars = await listContentPillars(brand.id);
    }
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load brand profile";
  }

  // Independent, best-effort: if migration 0002 (brand_files) hasn't been
  // applied yet, the rest of the page still works — file sections just show
  // with no attachments instead of taking down the whole page.
  if (brand && !loadError) {
    try {
      const filesResult = await listBrandFiles(brand.id);
      files = await Promise.all(
        filesResult.map(async (f) => ({ ...f, publicUrl: await getBrandFilePublicUrl(f.storage_path) })),
      );
    } catch {
      files = [];
    }
  }

  const detailValue: Record<string, string> = {
    business_identity: brand?.business_identity ?? "",
    objections: brand?.objections_notes ?? "",
    founder_story: brand?.founder_story ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brand Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Voice, ICP, platform, and guardrails — every generated draft is built from this.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t reach the database: {loadError}
        </div>
      ) : (
        <>
          <BrandForm brand={brand} />
          <PillarsSection brandId={brand?.id ?? null} pillars={pillars} />
          {brand &&
            BRAND_FILE_SECTIONS.map((s) => (
              <BrandDetailSection
                key={s.key}
                brandId={brand.id}
                section={s.key}
                label={s.label}
                helper={s.helper}
                initialValue={detailValue[s.key]}
                files={files.filter((f) => f.section === s.key)}
              />
            ))}
        </>
      )}
    </div>
  );
}
