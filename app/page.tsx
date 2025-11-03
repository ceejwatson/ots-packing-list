'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="text-center">
        <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-blue-900 text-3xl border-4 border-blue-700 mx-auto mb-4 animate-pulse">
          OTS
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-blue-100 font-semibold">Loading...</p>
      </div>
    </div>
  )
}
