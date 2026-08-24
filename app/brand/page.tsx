import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listContentPillars } from "@/lib/data/content-pillars";
import { BrandForm } from "@/components/brand-form";
import { PillarsSection } from "@/components/pillars-section";

export default async function BrandPage() {
  let brand = null as Awaited<ReturnType<typeof getActiveBrandProfile>> | null;
  let pillars: Awaited<ReturnType<typeof listContentPillars>> = [];
  let loadError: string | null = null;

  try {
    brand = await getActiveBrandProfile();
    if (brand) pillars = await listContentPillars(brand.id);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load brand profile";
  }

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
        </>
      )}
    </div>
  );
}
