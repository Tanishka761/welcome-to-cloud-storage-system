"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, RefreshCw, Database } from "lucide-react"

interface StorageStatus {
  bucketExists: boolean
  canUpload: boolean
  canList: boolean
  canDelete: boolean
  error?: string
}

export function StorageSetup() {
  const [checking, setChecking] = useState(true)
  const [status, setStatus] = useState<StorageStatus>({
    bucketExists: false,
    canUpload: false,
    canList: false,
    canDelete: false,
  })

  const checkStorageCapabilities = async () => {
    setChecking(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setStatus({
          bucketExists: false,
          canUpload: false,
          canList: false,
          canDelete: false,
          error: "User not authenticated",
        })
        setChecking(false)
        return
      }

      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        setStatus({
          bucketExists: false,
          canUpload: false,
          canList: false,
          canDelete: false,
          error: `Bucket check failed: ${bucketsError.message}`,
        })
        setChecking(false)
        return
      }

      const filesBucket = buckets?.find((bucket) => bucket.name === "files")

      if (!filesBucket) {
        setStatus({
          bucketExists: false,
          canUpload: false,
          canList: false,
          canDelete: false,
          error: "Files bucket not found",
        })
        setChecking(false)
        return
      }

      // Test listing files (this will work even if folder is empty)
      const { error: listError } = await supabase.storage.from("files").list(user.id, { limit: 1 })

      // Test upload capability with a tiny test file
      const testFile = new File(["test"], "test.txt", { type: "text/plain" })
      const testPath = `${user.id}/test-${Date.now()}.txt`

      const { error: uploadError } = await supabase.storage.from("files").upload(testPath, testFile)

      const canUpload = !uploadError
      let canDelete = false

      // If upload worked, test delete
      if (!uploadError) {
        const { error: deleteError } = await supabase.storage.from("files").remove([testPath])
        canDelete = !deleteError
      }

      setStatus({
        bucketExists: true,
        canUpload,
        canList: !listError,
        canDelete,
        error: uploadError ? `Upload test failed: ${uploadError.message}` : undefined,
      })
    } catch (error: any) {
      setStatus({
        bucketExists: false,
        canUpload: false,
        canList: false,
        canDelete: false,
        error: error.message,
      })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkStorageCapabilities()
  }, [])

  const StatusBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      {condition ? (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Working
        </Badge>
      ) : (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Storage System Status
        </CardTitle>
        <CardDescription>Testing your cloud storage capabilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checking ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Testing storage capabilities...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <StatusBadge condition={status.bucketExists} label="Storage Bucket" />
            <StatusBadge condition={status.canList} label="List Files" />
            <StatusBadge condition={status.canUpload} label="Upload Files" />
            <StatusBadge condition={status.canDelete} label="Delete Files" />
          </div>
        )}

        {status.error && (
          <Alert variant="destructive">
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        )}

        {!checking && status.bucketExists && status.canUpload && status.canList && status.canDelete && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 <strong>Perfect!</strong> Your cloud storage is fully configured and ready to use!
            </AlertDescription>
          </Alert>
        )}

        {!checking && (!status.canUpload || !status.canList) && (
          <Alert>
            <AlertDescription>
              <strong>Partial Setup:</strong> Some features may not work properly. This usually means Row Level Security
              (RLS) policies need to be configured. The app will still work with basic functionality.
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={checkStorageCapabilities} disabled={checking} className="w-full">
          {checking ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Testing Storage...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Test Again
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
