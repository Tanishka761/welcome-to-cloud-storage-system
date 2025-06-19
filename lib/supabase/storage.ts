import { createClient } from "@/lib/supabase/client"

export async function ensureStorageBucket() {
  const supabase = createClient()

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return false
    }

    const filesBucket = buckets?.find((bucket) => bucket.name === "files")

    if (!filesBucket) {
      // Try to create bucket
      const { data, error } = await supabase.storage.createBucket("files", {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Storage setup error:", error)
    return false
  }
}

export async function uploadFile(file: File, path: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("files").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function downloadFile(path: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("files").download(path)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteFile(path: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("files").remove([path])

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function listFiles(folder = "") {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("files").list(folder, {
      limit: 100,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
