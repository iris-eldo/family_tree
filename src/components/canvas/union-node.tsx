"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { UnionNodeData } from "@/store/canvas";

const RELATIONSHIP_SYMBOLS: Record<UnionNodeData["relationshipType"], string> =
  {
    married: "♦",
    partners: "◈",
    custom: "◇",
  };

function UnionNode({ data, selected }: NodeProps & { data: UnionNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" id="left" />
      <Handle type="target" position={Position.Right} className="opacity-0" id="right" />

      <div
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white text-xs shadow-sm transition-shadow dark:bg-zinc-900",
          selected
            ? "border-blue-500 shadow-md"
            : "border-zinc-400 dark:border-zinc-500",
        ].join(" ")}
        title={data.relationshipType}
      >
        <span className="text-zinc-500 dark:text-zinc-400">
          {RELATIONSHIP_SYMBOLS[data.relationshipType]}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  );
}

export default memo(UnionNode);
