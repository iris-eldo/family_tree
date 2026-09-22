// Sprint 2: Full canvas with React Flow, Zustand state, viewport persistence,
// canvas loading skeleton, and Zoom to Fit (F key).
// Sprint 1B: Auth guard will redirect unauthenticated users to /login.
export default async function CanvasPage({
  params,
}: {
  params: Promise<{ tree_id: string }>;
}) {
  const { tree_id } = await params;
  return (
    <div className="flex h-full items-center justify-center gap-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Canvas</h1>
        <p className="mt-1 font-mono text-sm text-zinc-500">tree_id: {tree_id}</p>
        <p className="mt-2 text-zinc-500">Canvas coming in Sprint 2.</p>
      </div>
    </div>
  );
}
