export interface PackingItem {
  id?: string
  category: 'Documents' | 'Required' | 'Recommended'
  item_name: string
  quantity: number
  is_packed: boolean
  notes?: string
  amazon_search?: string
  aafes_only?: boolean
}

export const defaultOTSPackingList: Omit<PackingItem, 'id' | 'is_packed'>[] = [
  // REQUIRED DOCUMENTS & IDENTIFICATION (from official guide pages 11-12)
  { category: 'Documents', item_name: 'Two forms of valid government ID', quantity: 2, notes: 'Include Social Security card if you do not have CAC' },
  { category: 'Documents', item_name: 'Five copies of orders', quantity: 5, notes: '1 in envelope, 4 additional copies for first week' },
  { category: 'Documents', item_name: 'Copy of amendments (if applicable)', quantity: 5, notes: 'Only if orders have been modified' },
  { category: 'Documents', item_name: 'Record of Emergency Data (vRED)', quantity: 1, notes: 'Certified within 12 months or DD Form 93' },
  { category: 'Documents', item_name: 'DD Form 2983', quantity: 1, notes: 'Recruit/Trainee Prohibited Activities Acknowledgment' },
  { category: 'Documents', item_name: 'OTS Form 1', quantity: 1, notes: 'Officer Trainee Questionnaire and Acknowledgment' },
  { category: 'Documents', item_name: 'SGLI (if applicable)', quantity: 1, notes: 'Certified SGLI from MilConnect or SGLV 8286 - for certain categories' },
  { category: 'Documents', item_name: 'DEERS Information Worksheet', quantity: 1, notes: 'Only if you need DEERS updates/enrollment' },
  { category: 'Documents', item_name: 'Marriage certificate, spouse ID & SSN card', quantity: 1, notes: 'Only if DEERS updates needed for spouse' },
  { category: 'Documents', item_name: 'Children birth certificates & SSN cards', quantity: 1, notes: 'Only if DEERS updates needed for children' },
  { category: 'Documents', item_name: 'DD Form 4 and DD Form 214', quantity: 1, notes: 'Only if prior Army, Marines, or Navy service' },
  { category: 'Documents', item_name: 'AF Form 56', quantity: 1, notes: 'Application & Evaluation for Training (includes SLECP)' },
  
  // MEDICAL DOCUMENTS (to upload to intakeQ - DO NOT hand carry)
  { category: 'Documents', item_name: 'Medical records uploaded to intakeQ', quantity: 1, notes: 'Upload 14 days prior - DO NOT hand carry or add to envelope' },
  { category: 'Documents', item_name: 'Immunization records', quantity: 1, notes: 'Upload to intakeQ' },
  { category: 'Documents', item_name: 'Titer results', quantity: 1, notes: 'Upload to intakeQ' },
  { category: 'Documents', item_name: 'AF Form 422', quantity: 1, notes: 'Completed within last 12 months - upload to intakeQ' },
  { category: 'Documents', item_name: 'ASIMS/MyIMR records', quantity: 1, notes: 'Upload to intakeQ' },
  { category: 'Documents', item_name: 'Sickle Cell Trait (SCT) test results', quantity: 1, notes: 'Upload to intakeQ to prevent PT restrictions' },
  { category: 'Documents', item_name: 'G6PD test results', quantity: 1, notes: 'Upload to intakeQ to prevent PT restrictions' },
  { category: 'Documents', item_name: 'Questionnaires from intakeQ', quantity: 1, notes: 'Complete all required questionnaires' },
  
  // REQUIRED UNIFORMS - UTILITY (OCP) - Purchase from AAFES only
  { category: 'Required', item_name: 'Coyote brown boots', quantity: 1, notes: 'Recommended: 2 pairs', aafes_only: true },
  { category: 'Required', item_name: 'OCP pants', quantity: 2, notes: 'Sex specific, 4 recommended', aafes_only: true },
  { category: 'Required', item_name: 'OCP blouse', quantity: 2, notes: 'Sex specific, 4 recommended', aafes_only: true },
  { category: 'Required', item_name: 'OCP patrol cap', quantity: 2, notes: '6-point and ball cap NOT authorized, 3 recommended', aafes_only: true },
  { category: 'Required', item_name: 'Rigger belt (Tan 499)', quantity: 1, aafes_only: true },
  { category: 'Required', item_name: 'Blousing straps', quantity: 2, notes: '4 recommended', aafes_only: true },
  { category: 'Required', item_name: 'Coyote brown crew neck t-shirts', quantity: 5, notes: '7 recommended', aafes_only: true },
  { category: 'Required', item_name: 'Coyote brown or DLA green OCP socks', quantity: 5, notes: '7 recommended', aafes_only: true },
  
  // REQUIRED UNIFORMS - SERVICE DRESS (BLUES) - Purchase from AAFES only
  { category: 'Required', item_name: 'Black dress oxford shoes', quantity: 1, notes: 'Plain toe, no high heels', aafes_only: true },
  { category: 'Required', item_name: 'Officer service coat', quantity: 1, notes: 'Must have dark braid and epaulets', aafes_only: true },
  { category: 'Required', item_name: 'Blues pants/skirt', quantity: 2, notes: 'Wool or polyester with minimum 1 wool', aafes_only: true },
  { category: 'Required', item_name: 'Long sleeve blues shirt', quantity: 1, notes: '2 recommended', aafes_only: true },
  { category: 'Required', item_name: 'Short sleeve blues shirt', quantity: 1, notes: '2 recommended', aafes_only: true },
  { category: 'Required', item_name: 'Flight cap', quantity: 1, notes: 'Silver/blue braiding, sex specific', aafes_only: true },
  { category: 'Required', item_name: 'Blues necktie/tab', quantity: 1, notes: 'Sex specific', aafes_only: true },
  { category: 'Required', item_name: 'Blue belt with chrome buckle', quantity: 1, aafes_only: true },
  { category: 'Required', item_name: 'White V-neck undershirts', quantity: 2, notes: '3 recommended', amazon_search: 'white+v+neck+undershirt' },
  { category: 'Required', item_name: 'Black dress socks', quantity: 2, notes: '4 recommended', amazon_search: 'black+dress+socks' },
  { category: 'Required', item_name: 'Shirt garters', quantity: 1, aafes_only: true },
  { category: 'Required', item_name: 'Lightweight blue jacket', quantity: 1, notes: 'May be embroidered', aafes_only: true },
  
  // REQUIRED UNIFORMS - PT GEAR - Purchase from AAFES only
  { category: 'Required', item_name: 'Running shoes', quantity: 1, amazon_search: 'running+shoes' },
  { category: 'Required', item_name: 'PT shorts', quantity: 3, notes: 'IAW USAF/USSF regs, 5 recommended', aafes_only: true },
  { category: 'Required', item_name: 'PT shirts', quantity: 3, notes: 'IAW USAF/USSF regs, 5 recommended', aafes_only: true },
  { category: 'Required', item_name: 'PT pants', quantity: 1, notes: 'Running suit or sweats, 2 recommended', aafes_only: true },
  { category: 'Required', item_name: 'PT jacket', quantity: 1, notes: 'Running suit or sweats, 2 recommended', aafes_only: true },
  { category: 'Required', item_name: 'PT socks', quantity: 5, notes: 'Per DAFI 36-2903, 7 recommended', amazon_search: 'white+athletic+socks' },
  
  // REQUIRED ACCOUTREMENTS - AIR FORCE - Purchase from AAFES only
  { category: 'Required', item_name: 'Name tapes (1" wide)', quantity: 2, notes: 'Spice brown on OCP (or blue for USSF)', aafes_only: true },
  { category: 'Required', item_name: 'USAF/USSF service tapes (1" wide)', quantity: 2, notes: 'Spice brown (or blue for USSF)', aafes_only: true },
  { category: 'Required', item_name: 'US Flag patch', quantity: 2, notes: 'Spice brown embroidered (full color for USSF)', aafes_only: true },
  { category: 'Required', item_name: 'Velcro rank insignia', quantity: 2, notes: 'Spice brown embroidered (blue for USSF)', aafes_only: true },
  { category: 'Required', item_name: 'Blues name tag', quantity: 1, notes: 'Blue plastic', aafes_only: true },
  { category: 'Required', item_name: 'Service dress name tag', quantity: 1, notes: 'Silver metal', aafes_only: true },
  { category: 'Required', item_name: 'US Officer lapel pins', quantity: 1, notes: 'Set of 2 for service coat', aafes_only: true },
  { category: 'Required', item_name: 'Metal rank insignia', quantity: 3, notes: 'For service coat epaulet and flight cap', aafes_only: true },
  { category: 'Required', item_name: 'Epaulet rank', quantity: 1, notes: 'Set of 2, sex specific', aafes_only: true },
  { category: 'Required', item_name: 'Ribbon rack', quantity: 1, aafes_only: true },
  
  // REQUIRED PERSONAL ITEMS
  { category: 'Required', item_name: 'Prescription medications', quantity: 1, notes: '90-day supply in original containers' },
  { category: 'Required', item_name: 'Washcloth', quantity: 2, amazon_search: 'washcloth' },
  { category: 'Required', item_name: 'Shower shoes/flip flops', quantity: 1, amazon_search: 'shower+sandals' },
  { category: 'Required', item_name: 'Toiletry bag', quantity: 1, amazon_search: 'toiletry+bag' },
  { category: 'Required', item_name: 'Hard soap with case or shower gel', quantity: 1, amazon_search: 'soap+case+travel' },
  { category: 'Required', item_name: 'Shampoo and conditioner', quantity: 1, amazon_search: 'travel+shampoo+conditioner' },
  { category: 'Required', item_name: 'Personal hygiene items', quantity: 1, notes: 'Shaving, hair, feminine supplies for 60 days', amazon_search: 'toiletry+kit' },
  { category: 'Required', item_name: 'Black backpack', quantity: 1, notes: 'IAW DAFI 36-2903, for 72-hour bag', amazon_search: 'black+tactical+backpack' },
  { category: 'Required', item_name: 'Hydration pack (1.5L minimum)', quantity: 1, notes: 'Max 18"x12"x5", must have document pouch', amazon_search: 'hydration+pack+camelbak' },
  { category: 'Required', item_name: 'Black ball point pens', quantity: 5, amazon_search: 'black+ball+point+pens' },
  { category: 'Required', item_name: 'Notepaper/pocket notebook', quantity: 2, amazon_search: 'pocket+notebook+military' },
  { category: 'Required', item_name: 'Duffel bag', quantity: 1, notes: 'For field deployment', amazon_search: 'military+duffel+bag' },
  { category: 'Required', item_name: 'Towels', quantity: 2, notes: 'No wider than 24" x 44"', amazon_search: 'towel+24x44' },
  { category: 'Required', item_name: 'Wristwatch', quantity: 1, notes: 'Smart watches authorized with restrictions', amazon_search: 'military+watch' },
  { category: 'Required', item_name: 'Flashlight', quantity: 1, notes: 'Less than 5 inches long, extra batteries', amazon_search: 'tactical+flashlight+small' },
  { category: 'Required', item_name: 'Eye protection (wrap-around)', quantity: 1, notes: 'Must have fully enclosed sides', amazon_search: 'military+ballistic+glasses' },
  { category: 'Required', item_name: 'Eyeglass strap', quantity: 1, notes: 'Required to secure glasses during field events', amazon_search: 'eyeglass+strap+tactical' },
  { category: 'Required', item_name: 'Prescription eyeglasses', quantity: 2, notes: 'If needed, military-approved frames' },
  { category: 'Required', item_name: 'Combination lock', quantity: 1, amazon_search: 'combination+padlock' },
  { category: 'Required', item_name: 'Gallon-sized ziplock bags', quantity: 5, notes: 'Clear', amazon_search: 'ziplock+gallon+bags' },
  { category: 'Required', item_name: 'Sandwich-sized ziplock bags', quantity: 5, notes: 'Clear', amazon_search: 'ziplock+sandwich+bags' },
  { category: 'Required', item_name: 'Cell phone and charger', quantity: 1, notes: 'Limited use during training' },
  { category: 'Required', item_name: 'Cash', quantity: 1, notes: 'At least $2,000 accessible, $65-75 exact for field meals' },
  
  // RECOMMENDED ITEMS
  { category: 'Recommended', item_name: 'Rechargeable fan', quantity: 1, notes: 'USB or battery powered for dorm', amazon_search: 'rechargeable+usb+fan+portable' },
  { category: 'Recommended', item_name: 'Electrolytes', quantity: 1, notes: 'For hydration pack', amazon_search: 'electrolyte+powder+packets' },
  { category: 'Recommended', item_name: 'Laptop with accessories', quantity: 1, notes: 'Surge protector, CAC reader, headphones, waterproof case', amazon_search: 'laptop' },
  { category: 'Recommended', item_name: 'Printer (optional)', quantity: 1, notes: 'Check current policy', amazon_search: 'compact+printer' },
  { category: 'Recommended', item_name: 'Printer paper', quantity: 1, amazon_search: 'printer+paper' },
  { category: 'Recommended', item_name: 'Laundry bag', quantity: 1, amazon_search: 'laundry+bag' },
  { category: 'Recommended', item_name: 'Mesh laundry bag', quantity: 1, amazon_search: 'mesh+laundry+bag' },
  { category: 'Recommended', item_name: 'Starch', quantity: 1, notes: 'For uniforms', amazon_search: 'spray+starch' },
  { category: 'Recommended', item_name: 'Hangers', quantity: 10, amazon_search: 'plastic+hangers' },
  { category: 'Recommended', item_name: 'Laundry detergent', quantity: 1, amazon_search: 'laundry+detergent+pods' },
  { category: 'Recommended', item_name: 'Sewing kit', quantity: 1, amazon_search: 'sewing+kit+military' },
  { category: 'Recommended', item_name: 'Scissors', quantity: 1, amazon_search: 'small+scissors' },
  { category: 'Recommended', item_name: 'Lint roller', quantity: 1, amazon_search: 'lint+roller' },
  { category: 'Recommended', item_name: 'Bug spray', quantity: 1, amazon_search: 'bug+spray+deet' },
  { category: 'Recommended', item_name: 'Sunscreen', quantity: 1, notes: 'SPF 30+', amazon_search: 'sunscreen+spf+50' },
  { category: 'Recommended', item_name: 'Blister prevention', quantity: 1, notes: 'Moleskin or similar', amazon_search: 'moleskin+blister+prevention' },
  { category: 'Recommended', item_name: 'Pain relief medication', quantity: 1, notes: 'Over-the-counter (Motrin, Tylenol)', amazon_search: 'ibuprofen+travel' },
  { category: 'Recommended', item_name: 'OCP fleece jacket', quantity: 1, notes: 'Coyote brown, for cold weather (not June-Sept)', aafes_only: true },
  { category: 'Recommended', item_name: 'Watch cap', quantity: 1, notes: 'Black or coyote brown (not June-Sept)', aafes_only: true },
  { category: 'Recommended', item_name: 'Gloves', quantity: 2, notes: '1 warm pair, 1 work pair (not June-Sept)', amazon_search: 'tactical+gloves+coyote+brown' },
  { category: 'Recommended', item_name: 'OCP rain gear', quantity: 1, notes: 'All-Purpose Environmental Clothing System', aafes_only: true },
  { category: 'Recommended', item_name: 'Religious items', quantity: 1, notes: 'Faith books, prayer mats, rosary, etc.' },
]

// Helper function to generate Amazon link
export function getAmazonLink(searchQuery: string): string {
  const associateId = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'your-associate-20'
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${associateId}`
}
