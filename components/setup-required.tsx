"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EnvSetupGuide } from "@/components/env-setup-guide"
import { StorageSetup } from "@/components/storage-setup"
import { Cloud, Settings } from "lucide-react"

export function SetupRequired() {
  const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Setup Required</CardTitle>
            <CardDescription>Configure your Supabase connection to get started with cloud storage</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                This application requires Supabase configuration to function. Follow the steps below to set up your
                cloud storage system.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {!hasEnvVars ? (
          <EnvSetupGuide />
        ) : (
          <div className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ Environment variables are configured correctly!
              </AlertDescription>
            </Alert>
            <StorageSetup />
          </div>
        )}
      </div>
    </div>
  )
}
