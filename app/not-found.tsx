import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
      <p className="text-lg font-semibold">Not found</p>
      <p className="mt-1 text-sm text-neutral-500">This idea or draft doesn&apos;t exist (or was deleted).</p>
      <Link href="/" className="mt-4 inline-block text-sm font-medium underline underline-offset-2">
        Back to dashboard
      </Link>
    </div>
  );
}
