// Full-screen layout for the canvas editor.
// No padding, no scroll, no nav — React Flow takes the entire viewport.
export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">{children}</div>
  );
}
