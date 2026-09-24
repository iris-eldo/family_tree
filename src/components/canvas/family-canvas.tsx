"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCanvasStore, type FamilyNode } from "@/store/canvas";
import { ZoomToolbar } from "./zoom-toolbar";
import { CanvasSkeleton } from "./canvas-skeleton";
import PersonNode from "./person-node";
import UnionNode from "./union-node";
import { saveViewport, saveNodePosition } from "@/app/(canvas)/canvas/[tree_id]/actions";
import type { Database } from "@/types/database";
import { toast } from "sonner";

// Register custom node types — must be stable (defined outside component)
const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
} as const;

type PersonRow = Database["public"]["Tables"]["persons"]["Row"];
type UnionRow = Database["public"]["Tables"]["union_nodes"]["Row"];
type EdgeRow = Database["public"]["Tables"]["edges"]["Row"];

type FamilyCanvasProps = {
  treeId: string;
  persons: PersonRow[];
  unions: UnionRow[];
  dbEdges: EdgeRow[];
  savedViewport?: { x: number; y: number; zoom: number } | null;
};

// Transform DB rows into React Flow nodes
function buildNodes(persons: PersonRow[], unions: UnionRow[]): FamilyNode[] {
  const personNodes: FamilyNode[] = persons.map((p) => ({
    id: p.id,
    type: "person" as const,
    position: { x: p.canvas_x ?? 0, y: p.canvas_y ?? 0 },
    data: {
      personId: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      isLiving: p.is_living,
      shape: "circle" as const,
    },
  }));

  const unionNodes: FamilyNode[] = unions.map((u) => ({
    id: u.id,
    type: "union" as const,
    position: { x: u.canvas_x ?? 0, y: u.canvas_y ?? 0 },
    data: {
      unionId: u.id,
      relationshipType: u.relationship_type,
    },
  }));

  return [...personNodes, ...unionNodes];
}

// Transform DB edges into React Flow edges
function buildEdges(dbEdges: EdgeRow[]): Edge[] {
  return dbEdges.map((e) => ({
    id: e.id,
    source: e.union_node_id,
    target: e.child_person_id,
    // Dashed for non-biological relationships (Sprint 3 will refine with DAG engine)
    style:
      e.edge_type !== "biological"
        ? { strokeDasharray: "5 5" }
        : undefined,
    label:
      e.edge_type !== "biological"
        ? e.edge_type.charAt(0).toUpperCase() + e.edge_type.slice(1)
        : undefined,
  }));
}

export function FamilyCanvas({
  treeId,
  persons,
  unions,
  dbEdges,
  savedViewport,
}: FamilyCanvasProps) {
  const { nodes, edges, isLoading, setNodes, setEdges, setViewport, setLoading } =
    useCanvasStore();

  // Debounce ref for viewport persistence
  const viewportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodePositionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Initialize store from DB data on mount
  useEffect(() => {
    setNodes(buildNodes(persons, unions));
    setEdges(buildEdges(dbEdges));
    if (savedViewport) setViewport(savedViewport);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onNodesChange: OnNodesChange<FamilyNode> = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes) as FamilyNode[]);

      // Persist position changes with 2s debounce per node
      changes.forEach((change) => {
        if (change.type === "position" && change.dragging === false && change.id) {
          const nodeId = change.id;
          const node = nodes.find((n) => n.id === nodeId);
          if (!node || node.type !== "person") return;

          const existing = nodePositionTimers.current.get(nodeId);
          if (existing) clearTimeout(existing);

          const timer = setTimeout(async () => {
            try {
              await saveNodePosition(nodeId, treeId, node.position.x, node.position.y);
            } catch {
              toast.error("Failed to save node position.");
            }
            nodePositionTimers.current.delete(nodeId);
          }, 2000);

          nodePositionTimers.current.set(nodeId, timer);
        }
      });
    },
    [nodes, setNodes, treeId]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onViewportChange = useCallback(
    (vp: { x: number; y: number; zoom: number }) => {
      setViewport(vp);

      // Persist viewport with 2s debounce
      if (viewportTimer.current) clearTimeout(viewportTimer.current);
      viewportTimer.current = setTimeout(async () => {
        try {
          await saveViewport(treeId, vp);
        } catch {
          // Silent — viewport loss on refresh is acceptable
        }
      }, 2000);
    },
    [setViewport, treeId]
  );

  // Cleanup timers on unmount — capture current Map reference to avoid stale ref warning
  useEffect(() => {
    const timers = nodePositionTimers.current;
    const vpTimer = viewportTimer;
    return () => {
      if (vpTimer.current) clearTimeout(vpTimer.current);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {isLoading && <CanvasSkeleton />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onViewportChange={onViewportChange}
        defaultViewport={savedViewport ?? { x: 0, y: 0, zoom: 1 }}
        fitView={!savedViewport}
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
        <ZoomToolbar />
      </ReactFlow>
    </div>
  );
}
