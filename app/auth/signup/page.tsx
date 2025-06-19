import { createClient } from "@/lib/supabase/server"
import { SignUpForm } from "@/components/auth/signup-form"
import { SetupRequired } from "@/components/setup-required"
import { redirect } from "next/navigation"

export default async function SignUpPage() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SetupRequired />
  }

  try {
    const supabase = await createClient()

    // Check if user is already signed in
    const { data } = await supabase.auth.getSession()

    if (data.session?.user) {
      redirect("/")
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <SignUpForm />
      </div>
    )
  } catch (error) {
    console.error("Auth page error:", error)
    return <SetupRequired />
  }
}
