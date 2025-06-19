import { createClient } from "@/lib/supabase/server"
import Dashboard from "@/components/dashboard"
import { SetupRequired } from "@/components/setup-required"
import { redirect } from "next/navigation"

export default async function Home() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SetupRequired />
  }

  try {
    const supabase = await createClient()

    // Test the connection first
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Supabase auth error:", error)
      return <SetupRequired />
    }

    // Check if user is authenticated
    if (!data.session?.user) {
      redirect("/auth/signin")
    }

    return <Dashboard />
  } catch (error) {
    console.error("Supabase connection error:", error)
    return <SetupRequired />
  }
}
