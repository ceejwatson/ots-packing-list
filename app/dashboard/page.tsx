'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PackingItem, defaultOTSPackingList } from '@/lib/packing-list-data'

export default function Dashboard() {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    setUser(user)
    await loadItems(user.id)
  }

  const loadItems = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error loading items:', error)
    } else if (data && data.length === 0) {
      // Initialize with default items
      await initializeDefaultItems(userId)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const initializeDefaultItems = async (userId: string) => {
    const itemsToInsert = defaultOTSPackingList.map(item => ({
      ...item,
      user_id: userId,
      is_packed: false
    }))

    const { data, error } = await supabase
      .from('packing_items')
      .insert(itemsToInsert)
      .select()

    if (error) {
      console.error('Error initializing items:', error)
    } else {
      setItems(data || [])
    }
  }

  const togglePacked = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('packing_items')
      .update({ is_packed: !currentStatus })
      .eq('id', id)

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, is_packed: !currentStatus } : item
      ))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const categories = Array.from(new Set(items.map(item => item.category)))
  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter)

  const packedCount = items.filter(item => item.is_packed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your packing list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OTS Packing List</h1>
              <p className="text-sm text-gray-600">Officer Training School Preparation</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {packedCount} of {totalCount} items packed
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Packing List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    item.is_packed ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={item.is_packed}
                      onChange={() => togglePacked(item.id!, item.is_packed)}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-sm font-medium ${
                            item.is_packed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.category} • Qty: {item.quantity}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-blue-600 mt-1 italic">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
