export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500" />
      <p className="text-lg text-gray-600 font-medium">
        Loading analytics dashboard...
      </p>
    </div>
  )
}
