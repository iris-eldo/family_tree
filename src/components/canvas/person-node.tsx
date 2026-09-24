"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "@/store/canvas";

function PersonNode({ data, selected }: NodeProps & { data: PersonNodeData }) {
  const isCircle = data.shape === "circle";

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div
        className={[
          "flex min-w-[120px] max-w-[160px] flex-col items-center justify-center gap-0.5 border-2 bg-white px-3 py-2 text-center shadow-sm transition-shadow dark:bg-zinc-900",
          isCircle ? "rounded-full px-4 py-3" : "rounded-lg",
          selected
            ? "border-blue-500 shadow-md"
            : "border-zinc-300 dark:border-zinc-600",
        ].join(" ")}
      >
        <span className="text-xs font-semibold leading-tight">
          {data.firstName}
        </span>
        {data.lastName && (
          <span className="text-xs leading-tight text-zinc-500 dark:text-zinc-400">
            {data.lastName}
          </span>
        )}
        {!data.isLiving && (
          <span className="mt-0.5 text-[10px] text-zinc-400">†</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  );
}

export default memo(PersonNode);
