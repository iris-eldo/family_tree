export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav — Sprint 2 */}
      <header className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <p className="text-sm text-zinc-400">Nav coming in Sprint 2</p>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
