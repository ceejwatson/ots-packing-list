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
        <img 
          src="/ots-shield.png" 
          alt="OTS Shield" 
          className="w-32 h-32 mx-auto mb-4 animate-pulse"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-blue-100 font-semibold">Loading OTS Packing List...</p>
      </div>
    </div>
  )
}
