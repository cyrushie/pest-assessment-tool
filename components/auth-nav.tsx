"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, BarChart3 } from "lucide-react"

interface AuthNavProps {
  user?: {
    id: string
    email: string
    name?: string | null
    role: string
  } | null
}

export function AuthNav({ user }: AuthNavProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
          Admin Login
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push("/analytics")}>
        <BarChart3 className="w-4 h-4 mr-2" />
        Analytics
      </Button>
      <div className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg shadow-sm">
        <User className="w-4 h-4" />
        {user.name || user.email}
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
        <LogOut className="w-4 h-4 mr-2" />
        {loading ? "Logging out..." : "Logout"}
      </Button>
    </div>
  )
}
