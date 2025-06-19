"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import {
  Download,
  Trash2,
  Search,
  File,
  ImageIcon,
  Video,
  Music,
  Archive,
  FileText,
  Code,
  RefreshCw,
} from "lucide-react"

interface FileItem {
  name: string
  id: string
  updated_at: string
  metadata: {
    size: number
    mimetype: string
  }
}

const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-500" />
  if (mimetype.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />
  if (mimetype.startsWith("audio/")) return <Music className="h-4 w-4 text-green-500" />
  if (mimetype.includes("pdf") || mimetype.includes("document")) return <FileText className="h-4 w-4 text-red-500" />
  if (mimetype.includes("zip") || mimetype.includes("archive")) return <Archive className="h-4 w-4 text-orange-500" />
  if (mimetype.includes("javascript") || mimetype.includes("json") || mimetype.includes("html"))
    return <Code className="h-4 w-4 text-indigo-500" />
  return <File className="h-4 w-4 text-gray-500" />
}

const getFileType = (mimetype: string) => {
  if (mimetype.startsWith("image/")) return "Image"
  if (mimetype.startsWith("video/")) return "Video"
  if (mimetype.startsWith("audio/")) return "Audio"
  if (mimetype.includes("pdf")) return "PDF"
  if (mimetype.includes("document")) return "Document"
  if (mimetype.includes("zip") || mimetype.includes("archive")) return "Archive"
  if (mimetype.includes("javascript") || mimetype.includes("json") || mimetype.includes("html")) return "Code"
  return "File"
}

export function FileList() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const loadFiles = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase.storage.from("files").list(user.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      })

      if (error) throw error

      setFiles(data || [])
      setFilteredFiles(data || [])
    } catch (error: any) {
      setError(error.message || "Failed to load files from cloud storage")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  useEffect(() => {
    let filtered = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

    if (filterType !== "all") {
      filtered = filtered.filter(
        (file) => getFileType(file.metadata?.mimetype || "").toLowerCase() === filterType.toLowerCase(),
      )
    }

    setFilteredFiles(filtered)
  }, [searchTerm, filterType, files])

  const downloadFile = async (file: FileItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase.storage.from("files").download(`${user.id}/${file.name}`)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name.split("/").pop() || file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      setError(error.message || "Failed to download file from cloud")
    }
  }

  const deleteFile = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(file.id)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase.storage.from("files").remove([`${user.id}/${file.name}`])

      if (error) throw error

      setFiles((files) => files.filter((f) => f.id !== file.id))
      setFilteredFiles((files) => files.filter((f) => f.id !== file.id))
    } catch (error: any) {
      setError(error.message || "Failed to delete file from cloud storage")
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading files from cloud storage...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="archive">Archives</SelectItem>
            <SelectItem value="code">Code</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={loadFiles} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <File className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          {files.length === 0 ? (
            <div>
              <p className="text-lg font-medium mb-2">No files in cloud storage yet</p>
              <p className="text-sm">Upload your first file to get started!</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">No files match your search</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredFiles.length} of {files.length} files from cloud storage
          </div>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">{getFileIcon(file.metadata?.mimetype || "")}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name.split("/").pop()}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {getFileType(file.metadata?.mimetype || "")}
                    </Badge>
                    <span>{formatFileSize(file.metadata?.size || 0)}</span>
                    <span>•</span>
                    <span>{formatDate(file.updated_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile(file)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteFile(file)}
                  disabled={deleting === file.id}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  {deleting === file.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
