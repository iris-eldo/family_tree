/**
 * Sprint 4: undo/redo history store tests.
 *
 * Master Spec §5: session-local, snapshot-based, capped at 50 undo steps,
 * never persisted. These tests pin the cap boundary and the redo-branch
 * truncation behavior, which are the easiest things to silently break.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  useHistoryStore,
  MAX_UNDO_STEPS,
  type HistorySnapshot,
} from "@/store/history";

function snap(label: string): HistorySnapshot {
  return {
    nodes: [],
    edges: [{ id: label, source: "a", target: "b" }],
  };
}

const store = () => useHistoryStore.getState();

beforeEach(() => {
  store().clear();
});

describe("history: empty state", () => {
  it("starts with nothing to undo or redo", () => {
    expect(store().canUndo).toBe(false);
    expect(store().canRedo).toBe(false);
    expect(store().undo()).toBeNull();
    expect(store().redo()).toBeNull();
  });

  it("cannot undo past a lone baseline entry", () => {
    store().push(snap("baseline"));
    expect(store().canUndo).toBe(false);
    expect(store().undo()).toBeNull();
  });
});

describe("history: undo and redo", () => {
  it("undo returns the previous snapshot and redo returns the later one", () => {
    const baseline = snap("baseline");
    const edited = snap("edited");
    store().push(baseline);
    store().push(edited);

    expect(store().undo()).toBe(baseline);
    expect(store().redo()).toBe(edited);
  });

  it("returns the stored snapshots by reference, not copies", () => {
    const baseline = snap("baseline");
    store().push(baseline);
    store().push(snap("edited"));
    expect(store().undo()).toBe(baseline);
  });

  it("walks back and forward through several steps in order", () => {
    const states = ["s0", "s1", "s2", "s3"].map(snap);
    states.forEach((s) => store().push(s));

    expect(store().undo()).toBe(states[2]);
    expect(store().undo()).toBe(states[1]);
    expect(store().undo()).toBe(states[0]);
    expect(store().undo()).toBeNull();

    expect(store().redo()).toBe(states[1]);
    expect(store().redo()).toBe(states[2]);
    expect(store().redo()).toBe(states[3]);
    expect(store().redo()).toBeNull();
  });

  it("tracks canUndo/canRedo as the index moves", () => {
    store().push(snap("s0"));
    store().push(snap("s1"));
    expect(store().canUndo).toBe(true);
    expect(store().canRedo).toBe(false);

    store().undo();
    expect(store().canUndo).toBe(false);
    expect(store().canRedo).toBe(true);

    store().redo();
    expect(store().canUndo).toBe(true);
    expect(store().canRedo).toBe(false);
  });
});

describe("history: push semantics", () => {
  it("discards the redo branch when pushing after an undo", () => {
    const s0 = snap("s0");
    const s1 = snap("s1");
    const s2 = snap("s2");
    const branch = snap("branch");
    store().push(s0);
    store().push(s1);
    store().push(s2);

    store().undo(); // back at s1
    store().push(branch);

    expect(store().canRedo).toBe(false);
    expect(store().redo()).toBeNull();
    expect(store().undo()).toBe(s1);
    expect(store().undo()).toBe(s0);
  });

  it("ignores pushing the exact snapshot that is already current", () => {
    const s0 = snap("s0");
    store().push(s0);
    store().push(s0);
    expect(store().canUndo).toBe(false);
    expect(store().entries).toHaveLength(1);
  });

  it("does not ignore an equal-but-distinct snapshot", () => {
    store().push(snap("same"));
    store().push(snap("same"));
    expect(store().entries).toHaveLength(2);
    expect(store().canUndo).toBe(true);
  });
});

describe("history: 50-step cap", () => {
  it("allows exactly MAX_UNDO_STEPS undos after the cap is reached", () => {
    // baseline + well over the cap
    for (let i = 0; i < MAX_UNDO_STEPS + 20; i++) store().push(snap(`s${i}`));

    let undos = 0;
    while (store().undo() !== null) undos++;
    expect(undos).toBe(MAX_UNDO_STEPS);
  });

  it("evicts the oldest entries, keeping the most recent states", () => {
    const total = MAX_UNDO_STEPS + 10;
    const all = Array.from({ length: total }, (_, i) => snap(`s${i}`));
    all.forEach((s) => store().push(s));

    // The newest state is still current; the oldest reachable by undo is
    // exactly MAX_UNDO_STEPS entries back.
    let last: HistorySnapshot | null = null;
    for (let u = store().undo(); u !== null; u = store().undo()) last = u;
    expect(last).toBe(all[total - 1 - MAX_UNDO_STEPS]);
  });

  it("does not evict anything before the cap is reached", () => {
    const states = Array.from({ length: MAX_UNDO_STEPS + 1 }, (_, i) =>
      snap(`s${i}`)
    );
    states.forEach((s) => store().push(s));

    expect(store().entries).toHaveLength(MAX_UNDO_STEPS + 1);
    let last: HistorySnapshot | null = null;
    for (let u = store().undo(); u !== null; u = store().undo()) last = u;
    expect(last).toBe(states[0]);
  });

  it("keeps the index consistent so redo still works after eviction", () => {
    for (let i = 0; i < MAX_UNDO_STEPS + 5; i++) store().push(snap(`s${i}`));
    const undone = store().undo();
    expect(undone).not.toBeNull();
    expect(store().canRedo).toBe(true);
    expect(store().redo()).not.toBeNull();
  });
});

describe("history: clear", () => {
  it("resets entries, index and flags", () => {
    store().push(snap("s0"));
    store().push(snap("s1"));
    store().clear();

    expect(store().entries).toHaveLength(0);
    expect(store().index).toBe(-1);
    expect(store().canUndo).toBe(false);
    expect(store().canRedo).toBe(false);
    expect(store().undo()).toBeNull();
  });
});
