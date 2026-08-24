import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdeaById } from "@/lib/data/ideas";
import { getActiveBrandProfile } from "@/lib/data/brand-profiles";
import { listContentPillars } from "@/lib/data/content-pillars";
import { IdeaEditForm } from "@/components/idea-edit-form";
import { StatusBadge } from "@/components/status-badge";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idea = await getIdeaById(id);
  if (!idea) notFound();

  const brand = await getActiveBrandProfile();
  const pillars = brand ? await listContentPillars(brand.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/ideas" className="text-sm text-neutral-500 hover:underline">
          ← Ideas
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{idea.raw_topic}</h1>
        <div className="mt-2">
          <StatusBadge status={idea.status} />
        </div>
      </div>

      <IdeaEditForm idea={idea} pillars={pillars} />
    </div>
  );
}
