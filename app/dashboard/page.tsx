'use client'

import { useEffect, useState } from 'react'
import { PackingItem, defaultOTSPackingList, getAmazonLink } from '@/lib/packing-list-data'

export default function Dashboard() {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const stored = localStorage.getItem('ots-packing-list')
    if (stored) {
      setItems(JSON.parse(stored))
    } else {
      // Initialize with default items
      const initialItems = defaultOTSPackingList.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        is_packed: false
      }))
      setItems(initialItems)
      localStorage.setItem('ots-packing-list', JSON.stringify(initialItems))
    }
    setLoading(false)
  }

  const togglePacked = (id: string, currentStatus: boolean) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, is_packed: !currentStatus } : item
    )
    setItems(updatedItems)
    localStorage.setItem('ots-packing-list', JSON.stringify(updatedItems))
  }

  const resetList = () => {
    if (confirm('Are you sure you want to reset your packing list? This will uncheck all items.')) {
      const resetItems = items.map(item => ({ ...item, is_packed: false }))
      setItems(resetItems)
      localStorage.setItem('ots-packing-list', JSON.stringify(resetItems))
    }
  }

  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This will reset everything to default.')) {
      localStorage.removeItem('ots-packing-list')
      loadItems()
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-blue-100">Loading your packing list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header with Air Force branding */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                {/* OTS Logo placeholder - replace with actual logo */}
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-blue-900 text-xl border-4 border-blue-700">
                  OTS
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">
                    OTS PACKING LIST
                  </h1>
                  <p className="text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Officer Training School • U.S. Air Force
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetList}
                className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors border border-blue-500 font-semibold"
              >
                Reset Checks
              </button>
              <button
                onClick={clearData}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors border border-red-500 font-semibold"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar with Air Force styling */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border-t-4 border-yellow-400">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wide">Mission Progress</h2>
            <span className="text-3xl font-bold text-blue-900">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-6 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-800 h-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-xs font-bold text-white">{progress}%</span>
              )}
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-3 font-semibold">
            {packedCount} of {totalCount} items packed • {totalCount - packedCount} remaining
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-xl p-4 mb-6 border-l-4 border-yellow-400">
          <label className="block text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
            Filter by Category
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-blue-900 font-semibold"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Packing List */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border-t-4 border-blue-700">
          <div className="divide-y divide-blue-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-blue-600 font-semibold">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 transition-colors ${
                    item.is_packed 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.is_packed}
                      onChange={() => togglePacked(item.id!, item.is_packed)}
                      className="mt-1 h-5 w-5 text-blue-700 focus:ring-blue-600 border-blue-300 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            item.is_packed 
                              ? 'line-through text-gray-500' 
                              : 'text-blue-900'
                          }`}>
                            {item.item_name}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            {item.category} • Qty: {item.quantity}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-blue-700 mt-1 italic bg-blue-50 inline-block px-2 py-1 rounded">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        {item.amazon_search && (
                          <a
                            href={getAmazonLink(item.amazon_search)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-md transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 border border-orange-700"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.544.41-3.146.615-4.806.615-2.162 0-4.254-.353-6.27-1.057-2.014-.703-3.777-1.703-5.29-2.996-.214-.177-.293-.344-.24-.494zm23.11-3.45c-.28-.386-.85-.577-1.707-.577-.524 0-1.124.08-1.8.24-.677.162-1.18.327-1.512.495-.333.168-.5.41-.5.726 0 .224.08.407.24.548.16.14.362.21.606.21.177 0 .384-.046.618-.14.234-.095.47-.21.71-.348.506-.292 1.022-.438 1.546-.438.6 0 1.05.14 1.35.42.3.28.45.676.45 1.19 0 .262-.044.527-.13.79-.088.265-.223.57-.405.918-.16.302-.314.615-.46.94-.146.323-.22.62-.22.89 0 .364.13.648.39.854.26.205.596.308 1.008.308.266 0 .508-.036.725-.11.217-.073.422-.195.615-.365.193-.17.368-.39.525-.66.157-.27.288-.593.394-.97l.12-.42c.05-.178.106-.405.167-.68.06-.274.113-.555.16-.843.045-.288.068-.543.068-.766 0-.636-.18-1.14-.54-1.513z"/>
                            </svg>
                            BUY
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer with Air Force motto */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-300 text-xs mt-1">
            Prepare for excellence at Maxwell AFB, Alabama
          </p>
        </div>
      </main>
    </div>
  )
}
