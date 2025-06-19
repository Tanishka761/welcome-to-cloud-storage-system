"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"
import { StorageStats } from "@/components/storage-stats"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Upload, Files, BarChart3, Cloud } from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"files" | "upload" | "stats">("files")
  const [refreshFiles, setRefreshFiles] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
    router.refresh()
  }

  const handleFileUploaded = () => {
    setRefreshFiles((prev) => prev + 1)
    setActiveTab("files")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CloudStore</h1>
                <p className="text-xs text-gray-500">Secure Cloud Storage</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <Badge variant="secondary" className="text-xs">
                  Premium User
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={activeTab === "files" ? "default" : "outline"}
              onClick={() => setActiveTab("files")}
              className="flex items-center gap-2"
            >
              <Files className="h-4 w-4" />
              My Files
            </Button>
            <Button
              variant={activeTab === "upload" ? "default" : "outline"}
              onClick={() => setActiveTab("upload")}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            <Button
              variant={activeTab === "stats" ? "default" : "outline"}
              onClick={() => setActiveTab("stats")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Storage Stats
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === "upload" && (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Files to Cloud
                </>
              )}
              {activeTab === "files" && (
                <>
                  <Files className="h-5 w-5" />
                  File Management
                </>
              )}
              {activeTab === "stats" && (
                <>
                  <BarChart3 className="h-5 w-5" />
                  Storage Analytics
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "upload" && <FileUpload onFileUploaded={handleFileUploaded} />}
            {activeTab === "files" && <FileList key={refreshFiles} />}
            {activeTab === "stats" && <StorageStats />}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
