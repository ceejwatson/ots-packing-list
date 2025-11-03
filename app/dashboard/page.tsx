'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackingItem, defaultOTSPackingList, getAmazonLink } from '@/lib/packing-list-data'

type TabType = 'Documents' | 'Required' | 'Recommended'

export default function Dashboard() {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('Documents')
  const router = useRouter()

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

  const filteredItems = items.filter(item => item.category === activeTab)
  const packedInCategory = filteredItems.filter(item => item.is_packed).length
  const totalInCategory = filteredItems.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="text-center">
          <img 
            src="/ots-shield.png" 
            alt="OTS Shield" 
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-blue-100 font-semibold">Loading your packing list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header with OTS Shield */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <img 
                  src="/ots-shield.png" 
                  alt="OTS Shield" 
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">
                    OTS PACKING LIST
                  </h1>
                  <p className="text-sm text-blue-200 font-semibold uppercase tracking-wider">
                    Official Orientation Guide • Class 06-10-2025
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/faqs')}
                className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-blue-900 rounded-md transition-colors font-bold"
              >
                FAQs
              </button>
              <button
                onClick={resetList}
                className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors border border-blue-500 font-semibold"
              >
                Reset
              </button>
              <button
                onClick={clearData}
                className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors border border-red-500 font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-xl border-t-4 border-yellow-400 overflow-hidden">
          <div className="flex border-b-2 border-blue-200">
            <button
              onClick={() => setActiveTab('Documents')}
              className={`flex-1 px-6 py-4 font-bold uppercase tracking-wide transition-colors text-sm ${
                activeTab === 'Documents'
                  ? 'bg-blue-700 text-white border-b-4 border-yellow-400'
                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              }`}
            >
              📄 Documents ({items.filter(i => i.category === 'Documents' && i.is_packed).length}/{items.filter(i => i.category === 'Documents').length})
            </button>
            <button
              onClick={() => setActiveTab('Required')}
              className={`flex-1 px-6 py-4 font-bold uppercase tracking-wide transition-colors text-sm ${
                activeTab === 'Required'
                  ? 'bg-blue-700 text-white border-b-4 border-yellow-400'
                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              }`}
            >
              ✓ Required ({items.filter(i => i.category === 'Required' && i.is_packed).length}/{items.filter(i => i.category === 'Required').length})
            </button>
            <button
              onClick={() => setActiveTab('Recommended')}
              className={`flex-1 px-6 py-4 font-bold uppercase tracking-wide transition-colors text-sm ${
                activeTab === 'Recommended'
                  ? 'bg-blue-700 text-white border-b-4 border-yellow-400'
                  : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
              }`}
            >
              ★ Recommended ({items.filter(i => i.category === 'Recommended' && i.is_packed).length}/{items.filter(i => i.category === 'Recommended').length})
            </button>
          </div>

          {/* Category Info */}
          <div className="bg-blue-50 px-6 py-3 border-b-2 border-blue-200">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-blue-900">
                {activeTab === 'Documents' && '📄 DOCUMENTS - Required paperwork and medical records for in-processing'}
                {activeTab === 'Required' && '✓ REQUIRED - Essential items from official OTS Orientation Guide'}
                {activeTab === 'Recommended' && '★ RECOMMENDED - Helpful items to enhance your OTS experience'}
              </p>
              <p className="text-sm font-bold text-blue-700">
                {packedInCategory}/{totalInCategory} complete
              </p>
            </div>
          </div>

          {/* Packing List */}
          <div className="divide-y divide-blue-100 max-h-[600px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-blue-600 font-semibold">
                No items in this category
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
                            Qty: {item.quantity}
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

        {/* Important Notice */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 text-sm uppercase">Important Reminders</h3>
              <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                <li>• <strong>Documents:</strong> Upload medical records to intakeQ 14 days before arrival - DO NOT hand carry</li>
                <li>• <strong>Boots & Running Shoes</strong> must be broken in before arrival</li>
                <li>• Bring <strong>90-day supply</strong> of all prescription medications</li>
                <li>• Have <strong>$2,000+ accessible</strong> - pay delays are common</li>
                <li>• Purchase uniforms from <strong>AAFES only</strong> to ensure compliance</li>
                <li>• Complete all <strong>pre-course assignments</strong> 10 days before arrival</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer with Air Force motto */}
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-sm font-semibold italic">
            "Aim High... Fly-Fight-Win"
          </p>
          <p className="text-blue-300 text-xs mt-1">
            Maxwell AFB, Alabama • Class Start: 06-10-2025
          </p>
        </div>
      </main>
    </div>
  )
}
