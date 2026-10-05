"use client";

import { create } from "zustand";
import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "@/store/canvas";

/**
 * Sprint 4: session-local undo/redo history (Master Spec §5, Sprint Roadmap).
 *
 * A linear timeline of settled canvas states. `entries[index]` is the
 * current state; undo moves the index back, redo moves it forward. Nothing
 * here touches the database or the canvas store — callers apply the
 * snapshot returned by undo()/redo() to the canvas themselves, and must not
 * push() while doing so.
 *
 * Conventions for callers:
 * - push() the initial loaded state once as the baseline, otherwise the
 *   first user action cannot be undone.
 * - push() the state AFTER a mutation has settled (drag end, debounced
 *   field save), never per drag tick or keystroke.
 * - Snapshots are stored by reference. Treat them as immutable; Zustand's
 *   immutable updates keep consecutive snapshots structurally shared, so
 *   50 snapshots of a large tree do not hold 50 full copies.
 */

export type HistorySnapshot = {
  nodes: FamilyNode[];
  edges: Edge[];
};

/** Maximum number of undoable steps (Master Spec §5). */
export const MAX_UNDO_STEPS = 50;

// Baseline + MAX_UNDO_STEPS later states = MAX_UNDO_STEPS undoable steps.
const MAX_ENTRIES = MAX_UNDO_STEPS + 1;

type HistoryState = {
  entries: HistorySnapshot[];
  index: number;
  canUndo: boolean;
  canRedo: boolean;

  push: (snapshot: HistorySnapshot) => void;
  /** Returns the snapshot to restore, or null if there is nothing to undo. */
  undo: () => HistorySnapshot | null;
  /** Returns the snapshot to restore, or null if there is nothing to redo. */
  redo: () => HistorySnapshot | null;
  clear: () => void;
};

function flags(entries: HistorySnapshot[], index: number) {
  return { canUndo: index > 0, canRedo: index < entries.length - 1 };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  index: -1,
  canUndo: false,
  canRedo: false,

  push: (snapshot) => {
    const { entries, index } = get();

    // A no-op mutation must not consume an undo step.
    if (index >= 0 && entries[index] === snapshot) return;

    // A new action after an undo discards the redo branch.
    let next = [...entries.slice(0, index + 1), snapshot];

    // Evict the oldest entries on overflow.
    if (next.length > MAX_ENTRIES) {
      next = next.slice(next.length - MAX_ENTRIES);
    }

    const nextIndex = next.length - 1;
    set({ entries: next, index: nextIndex, ...flags(next, nextIndex) });
  },

  undo: () => {
    const { entries, index } = get();
    if (index <= 0) return null;

    const nextIndex = index - 1;
    set({ index: nextIndex, ...flags(entries, nextIndex) });
    return entries[nextIndex];
  },

  redo: () => {
    const { entries, index } = get();
    if (index >= entries.length - 1) return null;

    const nextIndex = index + 1;
    set({ index: nextIndex, ...flags(entries, nextIndex) });
    return entries[nextIndex];
  },

  clear: () => set({ entries: [], index: -1, canUndo: false, canRedo: false }),
}));
