'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/api'

// "/" lleva directo a la app: dashboard si hay sesión, login si no.
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(getToken() ? '/dashboard' : '/login')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 font-bold text-white">S</span>
        <span className="text-lg font-semibold text-ink">Subvenciona</span>
      </div>
    </main>
  )
}
