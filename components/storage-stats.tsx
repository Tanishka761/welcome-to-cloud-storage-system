"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, HardDrive, Files, TrendingUp, Cloud } from "lucide-react"

interface StorageData {
  totalFiles: number
  totalSize: number
  fileTypes: { [key: string]: { count: number; size: number } }
  recentUploads: number
}

export function StorageStats() {
  const [stats, setStats] = useState<StorageData>({
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    recentUploads: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadStats = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: files, error } = await supabase.storage.from("files").list(user.id, {
        limit: 1000,
        offset: 0,
      })

      if (error) throw error

      const fileTypes: { [key: string]: { count: number; size: number } } = {}
      let totalSize = 0
      let recentUploads = 0
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      files?.forEach((file) => {
        const size = file.metadata?.size || 0
        totalSize += size

        // Count recent uploads
        if (new Date(file.updated_at) > oneWeekAgo) {
          recentUploads++
        }

        // Categorize by file type
        const mimetype = file.metadata?.mimetype || ""
        let category = "Other"

        if (mimetype.startsWith("image/")) category = "Images"
        else if (mimetype.startsWith("video/")) category = "Videos"
        else if (mimetype.startsWith("audio/")) category = "Audio"
        else if (mimetype.includes("pdf") || mimetype.includes("document")) category = "Documents"
        else if (mimetype.includes("zip") || mimetype.includes("archive")) category = "Archives"
        else if (mimetype.includes("javascript") || mimetype.includes("json") || mimetype.includes("html"))
          category = "Code"

        if (!fileTypes[category]) {
          fileTypes[category] = { count: 0, size: 0 }
        }
        fileTypes[category].count++
        fileTypes[category].size += size
      })

      setStats({
        totalFiles: files?.length || 0,
        totalSize,
        fileTypes,
        recentUploads,
      })
    } catch (error) {
      console.error("Failed to load storage stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const storageLimit = 5 * 1024 * 1024 * 1024 // 5GB limit
  const usagePercentage = (stats.totalSize / storageLimit) * 100

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading storage analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Files in cloud storage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">of 5GB available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">Files uploaded this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloud Status</CardTitle>
            <Cloud className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formatFileSize(stats.totalSize)}</span>
              <span>Available: {formatFileSize(storageLimit - stats.totalSize)}</span>
            </div>
            <Progress value={Math.min(usagePercentage, 100)} className="w-full" />
            <p className="text-xs text-gray-500">{usagePercentage.toFixed(1)}% of your cloud storage is being used</p>
          </div>
        </CardContent>
      </Card>

      {/* File Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>File Types Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.fileTypes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.fileTypes)
                .sort(([, a], [, b]) => b.size - a.size)
                .map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{type}</Badge>
                      <span className="text-sm text-gray-600">{data.count} files</span>
                    </div>
                    <div className="text-sm font-medium">{formatFileSize(data.size)}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
