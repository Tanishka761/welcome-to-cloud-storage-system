import { Cloud } from "lucide-react"

export function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full animate-pulse">
            <Cloud className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your cloud storage...</p>
      </div>
    </div>
  )
}
