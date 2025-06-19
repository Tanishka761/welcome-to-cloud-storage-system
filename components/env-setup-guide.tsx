"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ExternalLink, FileText, Settings } from "lucide-react"

export function EnvSetupGuide() {
  const [copied, setCopied] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateEnvContent = () => {
    return `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "https://pgikckktnhegsqboyeer.supabase.co"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWtja2t0bmhlZ3NxYm95ZWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjU2MzYsImV4cCI6MjA2NTY0MTYzNn0.9JA9cQqtfEXpE_5b7yM-eNEIG7k5wyWWENZGl27EcJI"}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Variables Setup
          </CardTitle>
          <CardDescription>Follow these steps to configure your Supabase connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>1</Badge>
              <h3 className="font-semibold">Get Your Supabase Credentials</h3>
            </div>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">Go to your Supabase dashboard and get your project credentials:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Supabase Dashboard
              </Button>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Select your project</p>
                <p>• Go to Settings → API</p>
                <p>• Copy "Project URL" and "anon public" key</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>2</Badge>
              <h3 className="font-semibold">Enter Your Credentials (Optional)</h3>
            </div>
            <div className="ml-8 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase Project URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                  <Input
                    id="supabase-key"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>3</Badge>
              <h3 className="font-semibold">Create .env.local File</h3>
            </div>
            <div className="ml-8 space-y-3">
              <p className="text-sm text-gray-600">
                Create a file named <code className="bg-gray-100 px-1 rounded">.env.local</code> in your project root
                directory and add:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {generateEnvContent()}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateEnvContent(), "env")}
                >
                  {copied === "env" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>4</Badge>
              <h3 className="font-semibold">File Location</h3>
            </div>
            <div className="ml-8">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The <code>.env.local</code> file should be in your project's root
                  directory, at the same level as your <code>package.json</code> file.
                  <br />
                  <br />
                  <strong>Project structure:</strong>
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                    {`my-project/
├── app/
├── components/
├── lib/
├── package.json
└── .env.local  ← Create this file here`}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Step 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>5</Badge>
              <h3 className="font-semibold">Restart Your Development Server</h3>
            </div>
            <div className="ml-8 space-y-2">
              <p className="text-sm text-gray-600">
                After creating the .env.local file, restart your development server:
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-sm">npm run dev</pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard("npm run dev", "command")}
                >
                  {copied === "command" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-green-200 bg-green-50">
        <AlertDescription className="text-green-800">
          <strong>Security Note:</strong> The .env.local file is automatically ignored by Git, so your credentials won't
          be committed to version control.
        </AlertDescription>
      </Alert>
    </div>
  )
}
