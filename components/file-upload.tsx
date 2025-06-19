"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Cloud, CheckCircle } from "lucide-react"

interface FileUploadProps {
  onFileUploaded: () => void
}

const FILE_TYPES = {
  image: {
    label: "Images",
    accept: "image/*",
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    icon: "🖼️",
  },
  document: {
    label: "Documents",
    accept: ".pdf,.doc,.docx,.txt,.rtf,.xlsx,.pptx",
    extensions: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".xlsx", ".pptx"],
    icon: "📄",
  },
  video: {
    label: "Videos",
    accept: "video/*",
    extensions: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv"],
    icon: "🎥",
  },
  audio: {
    label: "Audio",
    accept: "audio/*",
    extensions: [".mp3", ".wav", ".flac", ".aac", ".ogg"],
    icon: "🎵",
  },
  archive: {
    label: "Archives",
    accept: ".zip,.rar,.7z,.tar,.gz",
    extensions: [".zip", ".rar", ".7z", ".tar", ".gz"],
    icon: "📦",
  },
  code: {
    label: "Code Files",
    accept: ".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml",
    extensions: [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp", ".c", ".html", ".css", ".json", ".xml"],
    icon: "💻",
  },
  any: {
    label: "Any File Type",
    accept: "*/*",
    extensions: [],
    icon: "📁",
  },
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState<string>("any")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const supabase = createClient()

  const validateFileType = (file: File, type: string): boolean => {
    if (type === "any") return true

    const config = FILE_TYPES[type as keyof typeof FILE_TYPES]
    if (!config) return false

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    return config.extensions.length === 0 || config.extensions.includes(fileExtension)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 50MB.`)
        return false
      }
      return validateFileType(file, fileType)
    })

    if (validFiles.length !== files.length) {
      setError(`Some files were filtered out due to file type or size restrictions`)
    } else {
      setError("")
    }

    setSelectedFiles(validFiles)
    setSuccess("")
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError("")
    setSuccess("")
    setUploadProgress(0)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        const { error } = await supabase.storage.from("files").upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) throw error

        // Update progress
        const progress = ((index + 1) / selectedFiles.length) * 100
        setUploadProgress(progress)
      })

      await Promise.all(uploadPromises)

      setSuccess(`Successfully uploaded ${selectedFiles.length} file(s) to the cloud!`)
      setSelectedFiles([])
      onFileUploaded()
    } catch (error: any) {
      setError(error.message || "Failed to upload files to cloud storage")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      const validFiles = files.filter((file) => {
        if (file.size > 50 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 50MB.`)
          return false
        }
        return validateFileType(file, fileType)
      })

      if (validFiles.length !== files.length) {
        setError(`Some files were filtered out due to file type or size restrictions`)
      } else {
        setError("")
      }

      setSelectedFiles(validFiles)
      setSuccess("")
    },
    [fileType],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-type">File Type Filter</Label>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger>
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FILE_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-blue-50/50"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Cloud className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">Drop files here or click to browse</p>
            <p className="text-sm text-gray-500">Upload to secure cloud storage (Max 50MB per file)</p>
            {fileType !== "any" && (
              <p className="text-xs text-blue-600">
                Accepted: {FILE_TYPES[fileType as keyof typeof FILE_TYPES].extensions.join(", ")}
              </p>
            )}
          </div>
          <Input
            type="file"
            multiple
            accept={FILE_TYPES[fileType as keyof typeof FILE_TYPES].accept}
            onChange={handleFileSelect}
            className="mt-4"
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({selectedFiles.length})</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg">{FILE_TYPES[fileType as keyof typeof FILE_TYPES]?.icon || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-3">
          <Label>Uploading to Cloud Storage</Label>
          <Progress value={uploadProgress} className="w-full" />
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            {uploadProgress.toFixed(0)}% complete - Uploading to secure cloud...
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={uploadFiles}
        disabled={selectedFiles.length === 0 || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Uploading to Cloud...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload {selectedFiles.length} File(s) to Cloud
          </div>
        )}
      </Button>
    </div>
  )
}
