export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex container relative">
      <div className="flex-1 transition-opacity duration-200">
        <main>{children}</main>
      </div>
    </div>
  );
}
