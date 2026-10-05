/**
 * Sprint 4: Tests for elastic layout and collision detection.
 *
 * Per Sprint_Roadmap.md: "these are the most likely source of silent
 * regressions as the engine grows" — coverage is thorough, including
 * edge cases (no siblings, partial overlap, subtree propagation).
 */

import { describe, it, expect } from "vitest";
import { detectCollisions, type NodeRect } from "@/lib/dag/collision";
import { elasticShift, type SubtreeLink } from "@/lib/dag/elastic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rect(id: string, x: number, y: number, w = 160, h = 80): NodeRect {
  return { id, x, y, width: w, height: h };
}

// ---------------------------------------------------------------------------
// detectCollisions
// ---------------------------------------------------------------------------

describe("collision: detectCollisions", () => {
  it("returns empty for a single node", () => {
    expect(detectCollisions([rect("a", 0, 0)])).toEqual([]);
  });

  it("returns empty when two nodes are separated", () => {
    expect(detectCollisions([rect("a", 0, 0), rect("b", 200, 0)])).toEqual([]);
  });

  it("returns empty when nodes merely touch (share an edge)", () => {
    // a ends at x=160; b starts at x=160 → gap is 0 but no positive overlap
    expect(detectCollisions([rect("a", 0, 0), rect("b", 160, 0)])).toEqual([]);
  });

  it("detects a horizontal overlap", () => {
    const result = detectCollisions([rect("a", 0, 0), rect("b", 100, 0)]);
    expect(result).toHaveLength(1);
    expect(result[0].aId).toBe("a");
    expect(result[0].bId).toBe("b");
    expect(result[0].overlapX).toBe(60); // 160 - 100
    expect(result[0].overlapY).toBe(80);
  });

  it("detects a vertical overlap", () => {
    // Nodes side-by-side horizontally but one partially overlaps vertically
    const result = detectCollisions([rect("a", 0, 0), rect("b", 0, 50)]);
    expect(result).toHaveLength(1);
    expect(result[0].overlapX).toBe(160);
    expect(result[0].overlapY).toBe(30); // 80 - 50
  });

  it("returns no collision when nodes are on different rows with a gap", () => {
    // Row 0: y=0..80, Row 1: y=180..260 — 100px vertical gap
    expect(
      detectCollisions([rect("a", 0, 0), rect("b", 0, 180)])
    ).toEqual([]);
  });

  it("detects multiple collisions across several nodes", () => {
    const nodes = [
      rect("a", 0, 0),
      rect("b", 80, 0), // overlaps a
      rect("c", 160, 0), // does not overlap a; touches b but not strictly
      rect("d", 120, 0), // overlaps b and c
    ];
    const result = detectCollisions(nodes);
    const pairs = result.map((c) => [c.aId, c.bId].sort().join("-"));
    expect(pairs).toContain("a-b");
    expect(pairs).toContain("b-d");
    expect(pairs).toContain("c-d");
    expect(pairs).not.toContain("a-c"); // a ends at 160, c starts at 160
  });

  it("returns empty for two completely separate trees", () => {
    const nodes = [
      rect("a", 0, 0),
      rect("b", 280, 0),
      rect("c", 0, 180),
      rect("d", 280, 180),
    ];
    expect(detectCollisions(nodes)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// elasticShift
// ---------------------------------------------------------------------------

describe("elastic: elasticShift", () => {
  it("returns an empty map when the moved node does not exist", () => {
    const result = elasticShift([rect("a", 0, 0)], [], "nonexistent");
    expect(result.size).toBe(0);
  });

  it("returns an empty map when no siblings are close enough to push", () => {
    // a and b are 300px apart — well beyond the default 40px minGap
    const result = elasticShift(
      [rect("a", 0, 0), rect("b", 300, 0)],
      [],
      "a"
    );
    expect(result.size).toBe(0);
  });

  it("pushes a right sibling when the gap is below minGap", () => {
    // a at x=0 (width 160), b at x=180 → gap is 20px, minGap=40 → push b right by 20
    const result = elasticShift(
      [rect("a", 0, 0), rect("b", 180, 0)],
      [],
      "a"
    );
    expect(result.get("b")).toBe(20);
    expect(result.has("a")).toBe(false); // moved node never in result
  });

  it("pushes a left sibling when the gap is below minGap", () => {
    // b at x=0 (width 160), a at x=180 → a is moved, b is to the left
    // gap = 180 - (0+160) = 20px → push b left by 20
    const result = elasticShift(
      [rect("b", 0, 0), rect("a", 180, 0)],
      [],
      "a"
    );
    expect(result.get("b")).toBe(-20);
  });

  it("does not push when gap is exactly minGap", () => {
    // a ends at 160, b starts at 200 → gap = 40 = minGap → no push
    const result = elasticShift(
      [rect("a", 0, 0), rect("b", 200, 0)],
      [],
      "a"
    );
    expect(result.size).toBe(0);
  });

  it("respects a custom minGap", () => {
    // gap = 40, minGap = 80 → push by 40
    const result = elasticShift(
      [rect("a", 0, 0), rect("b", 200, 0)],
      [],
      "a",
      80
    );
    expect(result.get("b")).toBe(40);
  });

  it("propagates shift through the entire subtree", () => {
    // Tree: a(moved) — b — c — d (linear chain, same horizontal row for b)
    // a and b are on row y=0; c and d are below (y=180, y=360) as b's subtree
    const nodes = [
      rect("a", 0, 0),
      rect("b", 180, 0), // sibling of a, gap=20 → push right 20
      rect("c", 200, 180), // child of b
      rect("d", 200, 360), // grandchild of b
    ];
    const links: SubtreeLink[] = [
      { parentId: "b", childId: "c" },
      { parentId: "c", childId: "d" },
    ];
    const result = elasticShift(nodes, links, "a");
    expect(result.get("b")).toBe(20);
    expect(result.get("c")).toBe(20);
    expect(result.get("d")).toBe(20);
  });

  it("does not push nodes on different generational rows", () => {
    // b is directly below a (not a sibling) — different y-band, should not be pushed
    const nodes = [rect("a", 0, 0), rect("b", 100, 180)];
    const result = elasticShift(nodes, [], "a");
    expect(result.size).toBe(0);
  });

  it("handles multiple siblings being pushed simultaneously", () => {
    // a is moved to x=200; b at x=320 (gap=0, push right 40); c at x=60 (gap=0, push left 100)
    const nodes = [
      rect("a", 200, 0),
      rect("b", 320, 0), // right sibling: gap = 320-(200+160)=-40 → push right 80? Let's calc:
      // gap_right = b.x - (a.x + a.width) = 320 - 360 = -40 → needs 40+40=80 to get to minGap 40
      rect("c", 60, 0),  // left sibling: gap = a.x - (c.x + c.width) = 200 - 220 = -20 → push left 60
    ];
    const result = elasticShift(nodes, [], "a");
    // b: gap = 320 - 360 = -40; dx = 40 - (-40) = 80
    expect(result.get("b")).toBe(80);
    // c: gap = 200 - (60+160) = -20; dx = -(40 - (-20)) = -60
    expect(result.get("c")).toBe(-60);
  });

  it("takes the larger shift when multiple ancestors push the same descendant", () => {
    // b and c are both siblings of moved node a; d is a child of both b and c
    // b needs +20, c needs +30 — d should get +30 (larger magnitude wins)
    const nodes = [
      rect("a", 0, 0),
      rect("b", 180, 0), // gap=20 → +20
      rect("c", 190, 0), // gap=30 → wait, c is also on row 0 so it gets its own push
      rect("d", 200, 180),
    ];
    const links: SubtreeLink[] = [
      { parentId: "b", childId: "d" },
      { parentId: "c", childId: "d" },
    ];
    const result = elasticShift(nodes, links, "a");
    const dShift = result.get("d") ?? 0;
    // d inherits from both b and c — must be at least as large as the larger parent's push
    const bShift = result.get("b") ?? 0;
    const cShift = result.get("c") ?? 0;
    expect(Math.abs(dShift)).toBeGreaterThanOrEqual(
      Math.max(Math.abs(bShift), Math.abs(cShift))
    );
  });
});
