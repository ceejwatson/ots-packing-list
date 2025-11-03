export interface PackingItem {
  id?: string
  user_id?: string
  category: string
  item_name: string
  quantity: number
  is_packed: boolean
  notes?: string
}

export const defaultOTSPackingList: Omit<PackingItem, 'id' | 'user_id' | 'is_packed'>[] = [
  // Documentation & Personal Items
  { category: 'Documentation', item_name: 'Government-issued photo ID', quantity: 1, notes: 'Driver\'s license or passport' },
  { category: 'Documentation', item_name: 'Social Security card', quantity: 1 },
  { category: 'Documentation', item_name: 'Birth certificate (certified copy)', quantity: 1 },
  { category: 'Documentation', item_name: 'Marriage certificate (if applicable)', quantity: 1 },
  { category: 'Documentation', item_name: 'Direct deposit form', quantity: 1 },
  { category: 'Documentation', item_name: 'Orders/enlistment paperwork', quantity: 1 },
  
  // Clothing - Civilian
  { category: 'Civilian Clothing', item_name: 'Conservative business suit', quantity: 1, notes: 'For Day 1' },
  { category: 'Civilian Clothing', item_name: 'Conservative shoes', quantity: 1, notes: 'Dress shoes' },
  { category: 'Civilian Clothing', item_name: 'Conservative clothing for 2-3 days', quantity: 1 },
  { category: 'Civilian Clothing', item_name: 'Underwear (white/neutral)', quantity: 7 },
  { category: 'Civilian Clothing', item_name: 'White undershirts (crew neck)', quantity: 7 },
  { category: 'Civilian Clothing', item_name: 'White athletic socks', quantity: 7 },
  
  // Physical Training
  { category: 'PT Gear', item_name: 'Running shoes', quantity: 2, notes: 'Broken in' },
  { category: 'PT Gear', item_name: 'Athletic shorts', quantity: 3 },
  { category: 'PT Gear', item_name: 'Athletic shirts', quantity: 3 },
  { category: 'PT Gear', item_name: 'Sports bras (if applicable)', quantity: 3 },
  { category: 'PT Gear', item_name: 'Athletic underwear', quantity: 7 },
  
  // Toiletries
  { category: 'Toiletries', item_name: 'Toothbrush and toothpaste', quantity: 1 },
  { category: 'Toiletries', item_name: 'Deodorant (unscented)', quantity: 1 },
  { category: 'Toiletries', item_name: 'Shampoo and soap', quantity: 1 },
  { category: 'Toiletries', item_name: 'Razor and shaving cream', quantity: 1 },
  { category: 'Toiletries', item_name: 'Nail clippers', quantity: 1 },
  { category: 'Toiletries', item_name: 'Feminine hygiene products', quantity: 1, notes: 'If applicable' },
  { category: 'Toiletries', item_name: 'Prescription medications', quantity: 1, notes: 'With documentation' },
  { category: 'Toiletries', item_name: 'Contact lenses/solution or glasses', quantity: 1, notes: 'If needed' },
  
  // Study & Personal Items
  { category: 'Study Materials', item_name: 'Padlock (combination)', quantity: 2, notes: 'For locker' },
  { category: 'Study Materials', item_name: 'Black pens', quantity: 5 },
  { category: 'Study Materials', item_name: 'Notebooks', quantity: 2 },
  { category: 'Study Materials', item_name: 'Highlighters', quantity: 3 },
  { category: 'Study Materials', item_name: 'Watch (conservative)', quantity: 1 },
  { category: 'Study Materials', item_name: 'Address book or contacts list', quantity: 1 },
  { category: 'Study Materials', item_name: 'Stamps and envelopes', quantity: 1 },
  
  // Money & Cards
  { category: 'Financial', item_name: 'Cash ($200-300)', quantity: 1 },
  { category: 'Financial', item_name: 'Debit/credit card', quantity: 1 },
  { category: 'Financial', item_name: 'Checkbook', quantity: 1 },
  
  // Electronics (Limited)
  { category: 'Electronics', item_name: 'Cell phone', quantity: 1, notes: 'Limited use' },
  { category: 'Electronics', item_name: 'Phone charger', quantity: 1 },
  { category: 'Electronics', item_name: 'Laptop (optional)', quantity: 1, notes: 'Check current policy' },
]
