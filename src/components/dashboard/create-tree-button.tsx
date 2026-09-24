"use client";

import { useTransition, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createTree } from "@/app/(app)/dashboard/actions";

export function CreateTreeButton() {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTree(formData);
      if (result?.error) setError(result.error);
    });
  }

  if (!showForm) {
    return (
      <Button onClick={() => { setShowForm(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
        + New tree
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        name="name"
        type="text"
        required
        maxLength={100}
        placeholder="Family tree name"
        className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        disabled={isPending}
        onKeyDown={(e) => { if (e.key === "Escape") setShowForm(false); }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowForm(false)}
        disabled={isPending}
      >
        Cancel
      </Button>
    </form>
  );
}
