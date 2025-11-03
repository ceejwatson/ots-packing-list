export interface PackingItem {
  id?: string
  category: 'Required' | 'Recommended' | 'Uniform'
  item_name: string
  quantity: number
  is_packed: boolean
  notes?: string
  amazon_search?: string
}

export const defaultOTSPackingList: Omit<PackingItem, 'id' | 'is_packed'>[] = [
  // REQUIRED ITEMS - Must bring
  { category: 'Required', item_name: 'Government-issued photo ID', quantity: 1, notes: 'Driver\'s license or passport' },
  { category: 'Required', item_name: 'Social Security card', quantity: 1 },
  { category: 'Required', item_name: 'Birth certificate (certified copy)', quantity: 1 },
  { category: 'Required', item_name: 'Direct deposit form', quantity: 1 },
  { category: 'Required', item_name: 'Orders/enlistment paperwork', quantity: 1 },
  { category: 'Required', item_name: 'Marriage certificate', quantity: 1, notes: 'If applicable' },
  { category: 'Required', item_name: 'Conservative business suit', quantity: 1, notes: 'For Day 1', amazon_search: 'conservative+business+suit' },
  { category: 'Required', item_name: 'Conservative dress shoes', quantity: 1, notes: 'For Day 1', amazon_search: 'dress+shoes+black' },
  { category: 'Required', item_name: 'Running shoes', quantity: 2, notes: 'Must be broken in', amazon_search: 'running+shoes' },
  { category: 'Required', item_name: 'Prescription medications', quantity: 1, notes: 'With documentation from doctor' },
  { category: 'Required', item_name: 'Prescription glasses', quantity: 1, notes: 'If needed, must have military specs' },
  { category: 'Required', item_name: 'Cash', quantity: 1, notes: '$200-300 recommended' },
  { category: 'Required', item_name: 'Debit/credit card', quantity: 1 },
  { category: 'Required', item_name: 'Padlock (combination)', quantity: 2, notes: 'TSA approved', amazon_search: 'combination+padlock+tsa' },
  { category: 'Required', item_name: 'Black pens', quantity: 5, amazon_search: 'black+pens+pack' },
  { category: 'Required', item_name: 'Small notebook', quantity: 2, amazon_search: 'small+notebook' },
  
  // RECOMMENDED ITEMS - Highly suggested
  { category: 'Recommended', item_name: 'White undershirts (crew neck)', quantity: 7, notes: 'Cotton, OCP approved', amazon_search: 'white+crew+neck+undershirt+pack' },
  { category: 'Recommended', item_name: 'White athletic socks', quantity: 7, amazon_search: 'white+athletic+socks+pack' },
  { category: 'Recommended', item_name: 'Underwear (neutral colors)', quantity: 7, amazon_search: 'underwear+pack' },
  { category: 'Recommended', item_name: 'Athletic shorts', quantity: 3, amazon_search: 'athletic+shorts' },
  { category: 'Recommended', item_name: 'Athletic shirts', quantity: 3, notes: 'Moisture wicking', amazon_search: 'athletic+performance+shirts' },
  { category: 'Recommended', item_name: 'Sports bras', quantity: 3, notes: 'High support, if applicable', amazon_search: 'sports+bra+high+support' },
  { category: 'Recommended', item_name: 'Shower shoes/flip flops', quantity: 1, amazon_search: 'shower+sandals' },
  { category: 'Recommended', item_name: 'Toiletry bag', quantity: 1, amazon_search: 'toiletry+bag' },
  { category: 'Recommended', item_name: 'Toothbrush and toothpaste', quantity: 1, amazon_search: 'toothbrush+toothpaste' },
  { category: 'Recommended', item_name: 'Deodorant (unscented)', quantity: 1, amazon_search: 'unscented+deodorant' },
  { category: 'Recommended', item_name: 'Shampoo and soap', quantity: 1, notes: 'Travel size initially', amazon_search: 'travel+shampoo+soap' },
  { category: 'Recommended', item_name: 'Razor and shaving cream', quantity: 1, amazon_search: 'razor+shaving+cream' },
  { category: 'Recommended', item_name: 'Nail clippers', quantity: 1, amazon_search: 'nail+clippers' },
  { category: 'Recommended', item_name: 'Feminine hygiene products', quantity: 1, notes: 'If applicable', amazon_search: 'feminine+hygiene+products' },
  { category: 'Recommended', item_name: 'Contact lens solution', quantity: 1, notes: 'If needed', amazon_search: 'contact+lens+solution' },
  { category: 'Recommended', item_name: 'Highlighters', quantity: 3, notes: 'For studying', amazon_search: 'highlighters+set' },
  { category: 'Recommended', item_name: 'Watch', quantity: 1, notes: 'Digital with alarm, conservative', amazon_search: 'digital+watch+alarm' },
  { category: 'Recommended', item_name: 'Phone charger', quantity: 1, amazon_search: 'phone+charger+cable' },
  { category: 'Recommended', item_name: 'Stamps and envelopes', quantity: 1, notes: 'For letters home', amazon_search: 'stamps+envelopes' },
  { category: 'Recommended', item_name: 'Address book', quantity: 1, notes: 'With important contacts', amazon_search: 'address+book+small' },
  { category: 'Recommended', item_name: 'Laundry detergent pods', quantity: 1, notes: 'Small pack for first week', amazon_search: 'laundry+detergent+pods+travel' },
  { category: 'Recommended', item_name: 'Backpack', quantity: 1, notes: 'Small, black or neutral', amazon_search: 'small+backpack+black' },
  { category: 'Recommended', item_name: 'Sunscreen', quantity: 1, notes: 'SPF 30+', amazon_search: 'sunscreen+spf+30' },
  { category: 'Recommended', item_name: 'Chapstick', quantity: 1, amazon_search: 'chapstick' },
  { category: 'Recommended', item_name: 'Hand sanitizer', quantity: 1, notes: 'Travel size', amazon_search: 'hand+sanitizer+travel' },
  { category: 'Recommended', item_name: 'Protein bars/snacks', quantity: 1, notes: 'For first few days', amazon_search: 'protein+bars+pack' },
  
  // UNIFORM ITEMS - Will be issued but can bring if you have
  { category: 'Uniform', item_name: 'OCP uniform', quantity: 1, notes: 'Will be issued if you don\'t have' },
  { category: 'Uniform', item_name: 'OCP boots', quantity: 1, notes: 'Must be broken in if bringing', amazon_search: 'ocp+military+boots' },
  { category: 'Uniform', item_name: 'PT uniform', quantity: 1, notes: 'Will be issued' },
  { category: 'Uniform', item_name: 'Belt (military)', quantity: 1, notes: 'Rigger\'s belt preferred', amazon_search: 'military+rigger+belt' },
  { category: 'Uniform', item_name: 'Boot socks (green)', quantity: 3, notes: 'OCP approved', amazon_search: 'green+boot+socks+military' },
  { category: 'Uniform', item_name: 'Boot blousers', quantity: 2, notes: 'For OCP pants', amazon_search: 'boot+blousers' },
  { category: 'Uniform', item_name: 'Name tapes', quantity: 1, notes: 'Will be issued but can pre-order' },
]

// Helper function to generate Amazon link
export function getAmazonLink(searchQuery: string): string {
  const associateId = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'your-associate-20'
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${associateId}`
}
