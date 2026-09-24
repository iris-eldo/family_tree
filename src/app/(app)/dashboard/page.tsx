import { getTrees } from "./actions";
import { TreeCard } from "@/components/dashboard/tree-card";
import { CreateTreeButton } from "@/components/dashboard/create-tree-button";

export default async function DashboardPage() {
  const trees = await getTrees();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">My Trees</h1>
        <CreateTreeButton />
      </div>

      {trees.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-zinc-400">
          <p className="text-base">No trees yet.</p>
          <p className="text-sm">Create your first tree to get started.</p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trees.map((tree) => (
            <li key={tree.id}>
              <TreeCard
                id={tree.id}
                name={tree.name}
                updatedAt={tree.updated_at}
                privacy={tree.privacy as "public" | "private"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
