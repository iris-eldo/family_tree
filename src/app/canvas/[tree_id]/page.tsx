// Sprint 2: Full canvas with React Flow, Zustand state, and viewport persistence.
// Sprint 1B: Auth guard will be added.
export default async function CanvasPage({
  params,
}: {
  params: Promise<{ tree_id: string }>;
}) {
  const { tree_id } = await params;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Canvas</h1>
      <p className="text-zinc-500 font-mono text-sm">tree_id: {tree_id}</p>
      <p className="text-zinc-500">Canvas coming in Sprint 2.</p>
    </main>
  );
}
