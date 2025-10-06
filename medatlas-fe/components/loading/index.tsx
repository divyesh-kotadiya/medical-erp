export function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
