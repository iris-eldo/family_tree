/**
 * Sprint 3: DAG engine unit tests.
 *
 * Per Sprint_Roadmap.md: "these are the most likely source of silent
 * regressions as the engine grows" — coverage here is deliberately
 * thorough, including edge cases (missing parents, cycles) that
 * shouldn't occur in valid data but must not crash the engine.
 */

import { describe, it, expect } from "vitest";
import { calculateMidpoint } from "@/lib/dag/midpoint";
import { calculateGenerations } from "@/lib/dag/generations";
import { getEdgeStyle } from "@/lib/dag/edges";
import {
  calculateInitialLayout,
  HORIZONTAL_SPACING,
  VERTICAL_SPACING,
} from "@/lib/dag/layout";

describe("midpoint: calculateMidpoint", () => {
  it("returns the arithmetic midpoint of two partners", () => {
    expect(
      calculateMidpoint({ x: 0, y: 0 }, { x: 100, y: 50 })
    ).toEqual({ x: 50, y: 25 });
  });

  it("handles negative coordinates", () => {
    expect(
      calculateMidpoint({ x: -100, y: -50 }, { x: 100, y: 50 })
    ).toEqual({ x: 0, y: 0 });
  });

  it("returns the same point when both partners are at the same position", () => {
    expect(
      calculateMidpoint({ x: 20, y: 20 }, { x: 20, y: 20 })
    ).toEqual({ x: 20, y: 20 });
  });

  it("falls back to the known partner when the other parent is unknown", () => {
    expect(calculateMidpoint({ x: 10, y: 10 }, null)).toEqual({
      x: 10,
      y: 10,
    });
    expect(calculateMidpoint(null, { x: 30, y: 40 })).toEqual({
      x: 30,
      y: 40,
    });
  });

  it("returns the origin when both partners are unknown", () => {
    expect(calculateMidpoint(null, null)).toEqual({ x: 0, y: 0 });
  });
});

describe("generations: calculateGenerations (Lowest Parent rule)", () => {
  it("assigns generation 0 to a person with no parents", () => {
    const result = calculateGenerations({
      personIds: ["p1"],
      unionNodes: [],
      edges: [],
    });
    expect(result.get("p1")).toBe(0);
  });

  it("assigns a simple two-generation chain correctly", () => {
    // p1 + p2 -> union u1 -> child p3
    const result = calculateGenerations({
      personIds: ["p1", "p2", "p3"],
      unionNodes: [{ id: "u1", partner1Id: "p1", partner2Id: "p2" }],
      edges: [{ unionNodeId: "u1", childPersonId: "p3" }],
    });
    expect(result.get("p1")).toBe(0);
    expect(result.get("p2")).toBe(0);
    expect(result.get("p3")).toBe(1);
  });

  it("applies the Lowest Parent rule when parents are from different generations", () => {
    // p1 (gen 0) partners with p3 (gen 2, i.e. p1's grandchild's generation)
    // p1 + p2 -> u1 -> p3
    // p3 + p4 -> u2 -> p5 (p3 is gen 1, p5 should be gen 2)
    // p1 + p5 -> u3 -> p6 (p1 is gen 0, p5 is gen 2 -> p6 must be gen 3, not gen 1)
    const result = calculateGenerations({
      personIds: ["p1", "p2", "p3", "p4", "p5", "p6"],
      unionNodes: [
        { id: "u1", partner1Id: "p1", partner2Id: "p2" },
        { id: "u2", partner1Id: "p3", partner2Id: "p4" },
        { id: "u3", partner1Id: "p1", partner2Id: "p5" },
      ],
      edges: [
        { unionNodeId: "u1", childPersonId: "p3" },
        { unionNodeId: "u2", childPersonId: "p5" },
        { unionNodeId: "u3", childPersonId: "p6" },
      ],
    });

    expect(result.get("p1")).toBe(0);
    expect(result.get("p3")).toBe(1);
    expect(result.get("p5")).toBe(2);
    // Must be max(gen(p1), gen(p5)) + 1 = max(0, 2) + 1 = 3, not gen(p1)+1 = 1
    expect(result.get("p6")).toBe(3);
  });

  it("handles a union with only one known parent", () => {
    const result = calculateGenerations({
      personIds: ["p1", "p2"],
      unionNodes: [{ id: "u1", partner1Id: "p1", partner2Id: null }],
      edges: [{ unionNodeId: "u1", childPersonId: "p2" }],
    });
    expect(result.get("p1")).toBe(0);
    expect(result.get("p2")).toBe(1);
  });

  it("takes the max generation when a person has multiple parent unions", () => {
    // p3 is a child of both u1 (parent p1, gen 0) and u2 (parent p2, gen 1)
    const result = calculateGenerations({
      personIds: ["p0", "p1", "p2", "p3"],
      unionNodes: [
        { id: "u0", partner1Id: "p0", partner2Id: null },
        { id: "u1", partner1Id: "p1", partner2Id: null },
        { id: "u2", partner1Id: "p2", partner2Id: null },
      ],
      edges: [
        { unionNodeId: "u0", childPersonId: "p2" }, // p2 = gen 1 (child of p0)
        { unionNodeId: "u1", childPersonId: "p3" }, // p3 >= gen 1 via p1
        { unionNodeId: "u2", childPersonId: "p3" }, // p3 >= gen 2 via p2
      ],
    });
    expect(result.get("p2")).toBe(1);
    expect(result.get("p3")).toBe(2);
  });

  it("does not crash on a cycle and leaves cyclic members out of the result", () => {
    // p1 -> p2 -> p1 (invalid data, should never happen in a real tree)
    const result = calculateGenerations({
      personIds: ["p1", "p2"],
      unionNodes: [
        { id: "u1", partner1Id: "p1", partner2Id: null },
        { id: "u2", partner1Id: "p2", partner2Id: null },
      ],
      edges: [
        { unionNodeId: "u1", childPersonId: "p2" },
        { unionNodeId: "u2", childPersonId: "p1" },
      ],
    });
    expect(() => result).not.toThrow();
    expect(result.has("p1")).toBe(false);
    expect(result.has("p2")).toBe(false);
  });

  it("resolves the acyclic part of the graph even when an unrelated cycle exists", () => {
    const result = calculateGenerations({
      personIds: ["root", "child", "cycleA", "cycleB"],
      unionNodes: [
        { id: "u1", partner1Id: "root", partner2Id: null },
        { id: "u2", partner1Id: "cycleA", partner2Id: null },
        { id: "u3", partner1Id: "cycleB", partner2Id: null },
      ],
      edges: [
        { unionNodeId: "u1", childPersonId: "child" },
        { unionNodeId: "u2", childPersonId: "cycleB" },
        { unionNodeId: "u3", childPersonId: "cycleA" },
      ],
    });
    expect(result.get("root")).toBe(0);
    expect(result.get("child")).toBe(1);
    expect(result.has("cycleA")).toBe(false);
    expect(result.has("cycleB")).toBe(false);
  });

  it("ignores edges referencing unknown union nodes or persons", () => {
    const result = calculateGenerations({
      personIds: ["p1"],
      unionNodes: [],
      edges: [{ unionNodeId: "does-not-exist", childPersonId: "p1" }],
    });
    expect(result.get("p1")).toBe(0);
  });
});

describe("edges: getEdgeStyle", () => {
  it("renders biological connections as a solid line", () => {
    expect(getEdgeStyle("biological").strokeDasharray).toBeUndefined();
  });

  it.each(["adopted", "foster", "guardian"] as const)(
    "renders %s connections as a dashed line",
    (edgeType) => {
      expect(getEdgeStyle(edgeType).strokeDasharray).toBe("6 4");
    }
  );
});

describe("layout: calculateInitialLayout", () => {
  it("places a single person at the origin of their generation row", () => {
    const result = calculateInitialLayout([
      { personId: "p1", generationIndex: 0 },
    ]);
    expect(result).toEqual([{ personId: "p1", x: 0, y: 0 }]);
  });

  it("spaces siblings horizontally by HORIZONTAL_SPACING within a generation", () => {
    const result = calculateInitialLayout([
      { personId: "p1", generationIndex: 0 },
      { personId: "p2", generationIndex: 0 },
      { personId: "p3", generationIndex: 0 },
    ]);
    expect(result.map((p) => p.x)).toEqual([
      0,
      HORIZONTAL_SPACING,
      HORIZONTAL_SPACING * 2,
    ]);
    expect(result.every((p) => p.y === 0)).toBe(true);
  });

  it("spaces generations vertically by VERTICAL_SPACING", () => {
    const result = calculateInitialLayout([
      { personId: "p1", generationIndex: 0 },
      { personId: "p2", generationIndex: 1 },
      { personId: "p3", generationIndex: 2 },
    ]);
    expect(result.map((p) => p.y)).toEqual([
      0,
      VERTICAL_SPACING,
      VERTICAL_SPACING * 2,
    ]);
  });

  it("resets the horizontal column counter per generation", () => {
    const result = calculateInitialLayout([
      { personId: "p1", generationIndex: 0 },
      { personId: "p2", generationIndex: 0 },
      { personId: "p3", generationIndex: 1 },
    ]);
    const p3 = result.find((p) => p.personId === "p3")!;
    expect(p3.x).toBe(0);
    expect(p3.y).toBe(VERTICAL_SPACING);
  });

  it("returns an empty array for no input", () => {
    expect(calculateInitialLayout([])).toEqual([]);
  });
});
