"use client";

import { useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export function ZoomToolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 300 });
  }, [fitView]);

  // F key → Zoom to Fit
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") handleFitView();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFitView]);

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-t-lg text-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        +
      </button>
      <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={() => zoomOut({ duration: 200 })}
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center text-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        −
      </button>
      <div className="h-px w-full bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={handleFitView}
        aria-label="Zoom to fit (F)"
        title="Zoom to fit (F)"
        className="flex h-8 w-8 items-center justify-center rounded-b-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ⊡
      </button>
    </div>
  );
}
