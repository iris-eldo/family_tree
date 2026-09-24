"use client";

import Link from "next/link";

type TreeCardProps = {
  id: string;
  name: string;
  updatedAt: string;
  privacy: "public" | "private";
  collaboratorCount: number;
};

export function TreeCard({ id, name, updatedAt, privacy, collaboratorCount }: TreeCardProps) {
  const relativeTime = formatRelativeTime(updatedAt);

  return (
    <Link
      href={`/canvas/${id}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold leading-tight group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
          {name}
        </h2>
        {privacy === "public" && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            public
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span>Edited {relativeTime}</span>
        {collaboratorCount > 0 && (
          <span>· {collaboratorCount} collaborator{collaboratorCount !== 1 ? "s" : ""}</span>
        )}
      </div>
    </Link>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
