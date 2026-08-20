export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-kampmax-text-secondary">
          Kampmax — Your Campus Marketplace
        </p>
      </div>
    </div>
  );
}
