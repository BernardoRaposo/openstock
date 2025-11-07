export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500 mx-auto" />
        <p className="mt-4 text-slate-600">Loading products...</p>
      </div>
    </div>
  )
}
