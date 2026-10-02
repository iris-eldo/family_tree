"use client";

import { create } from "zustand";
import { type Node, type Edge, type Viewport } from "@xyflow/react";

export type PersonNodeData = {
  personId: string;
  firstName: string;
  lastName: string | null;
  isLiving: boolean;
  shape: "circle" | "square";
};

export type UnionNodeData = {
  unionId: string;
  relationshipType: "married" | "partners" | "custom";
};

export type FamilyNode = Node<PersonNodeData, "person"> | Node<UnionNodeData, "union">;

type CanvasSnapshot = {
  nodes: FamilyNode[];
  edges: Edge[];
};

type CanvasState = {
  nodes: FamilyNode[];
  edges: Edge[];
  viewport: Viewport;
  // Undo/redo stack (capped at 50 snapshots — Sprint 4)
  history: CanvasSnapshot[];
  historyIndex: number;
  // Loading
  isLoading: boolean;

  setNodes: (nodes: FamilyNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  setLoading: (loading: boolean) => void;

  // Optimistic update: apply immediately, provide rollback on failure
  applyOptimistic: (
    next: Partial<Pick<CanvasSnapshot, "nodes" | "edges">>,
    rollback: () => void,
    persist: () => Promise<void>
  ) => Promise<void>;
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,
  isLoading: true,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setViewport: (viewport) => set({ viewport }),
  setLoading: (isLoading) => set({ isLoading }),

  applyOptimistic: async (next, rollback, persist) => {
    const before: CanvasSnapshot = {
      nodes: get().nodes,
      edges: get().edges,
    };

    // Apply immediately
    set((s) => ({
      nodes: next.nodes ?? s.nodes,
      edges: next.edges ?? s.edges,
    }));

    try {
      await persist();
    } catch {
      // Rollback on failure
      set({ nodes: before.nodes, edges: before.edges });
      rollback();
    }
  },
}));
