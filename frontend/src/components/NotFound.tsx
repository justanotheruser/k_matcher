export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-red-300 mb-4">
          404 - Not Found
        </h1>
        <p className="text-red-300 text-lg">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
