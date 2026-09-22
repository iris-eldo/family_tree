import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Family Tree</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        An open-source collaborative family tree app. Build, share, and explore
        your family history on an infinite canvas.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Get Started
        </Link>
      </div>
      <p className="text-xs text-zinc-400">
        Sprint 1A — infrastructure only. Canvas coming in Sprint 2.
      </p>
    </main>
  );
}
