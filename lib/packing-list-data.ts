export interface PackingItem {
  id?: string
  category: 'Required' | 'Recommended'
  item_name: string
  quantity: number
  is_packed: boolean
  notes?: string
  amazon_search?: string
}

export const defaultOTSPackingList: Omit<PackingItem, 'id' | 'is_packed'>[] = [
  // REQUIRED DOCUMENTS & IDENTIFICATION
  { category: 'Required', item_name: 'Two forms of government ID', quantity: 1, notes: 'Include Social Security card if no CAC' },
  { category: 'Required', item_name: 'Five copies of orders', quantity: 5, notes: 'Plus amendments if applicable' },
  { category: 'Required', item_name: 'Record of Emergency Data (vRED)', quantity: 1, notes: 'Certified within 12 months or DD Form 93' },
  { category: 'Required', item_name: 'DD Form 2983', quantity: 1, notes: 'Prohibited Activities Acknowledgment' },
  { category: 'Required', item_name: 'OTS Form 1', quantity: 1, notes: 'Questionnaire and Acknowledgment' },
  { category: 'Required', item_name: 'SGLI Documentation', quantity: 1, notes: 'From MilConnect or SGLV 8286' },
  
  // REQUIRED UNIFORMS - UTILITY (OCP)
  { category: 'Required', item_name: 'Coyote brown boots', quantity: 1, notes: 'Must be broken in', amazon_search: 'coyote+brown+military+boots' },
  { category: 'Required', item_name: 'OCP pants', quantity: 2, notes: 'Sex specific, 4 recommended', amazon_search: 'ocp+pants' },
  { category: 'Required', item_name: 'OCP blouse', quantity: 2, notes: 'Sex specific, 4 recommended', amazon_search: 'ocp+blouse+top' },
  { category: 'Required', item_name: 'OCP patrol cap', quantity: 2, notes: '6-point and ball cap NOT authorized', amazon_search: 'ocp+patrol+cap' },
  { category: 'Required', item_name: 'Rigger belt (Tan 499)', quantity: 1, amazon_search: 'tan+499+rigger+belt' },
  { category: 'Required', item_name: 'Blousing straps', quantity: 2, notes: '4 recommended', amazon_search: 'boot+blousing+straps' },
  { category: 'Required', item_name: 'Coyote brown crew neck t-shirts', quantity: 5, notes: '7 recommended', amazon_search: 'coyote+brown+crew+neck+tshirt' },
  { category: 'Required', item_name: 'Coyote brown or DLA green OCP socks', quantity: 5, notes: '7 recommended', amazon_search: 'coyote+brown+boot+socks' },
  
  // REQUIRED UNIFORMS - SERVICE DRESS (BLUES)
  { category: 'Required', item_name: 'Black dress oxford shoes', quantity: 1, notes: 'Plain toe, no high heels', amazon_search: 'black+military+oxford+shoes' },
  { category: 'Required', item_name: 'Officer service coat', quantity: 1, notes: 'Must have dark braid and epaulets', amazon_search: 'air+force+service+dress+coat' },
  { category: 'Required', item_name: 'Blues pants/skirt', quantity: 2, notes: 'Wool or polyester with minimum 1 wool', amazon_search: 'air+force+blues+pants' },
  { category: 'Required', item_name: 'Long sleeve blues shirt', quantity: 1, notes: '2 recommended', amazon_search: 'air+force+blues+shirt+long+sleeve' },
  { category: 'Required', item_name: 'Short sleeve blues shirt', quantity: 1, notes: '2 recommended', amazon_search: 'air+force+blues+shirt+short+sleeve' },
  { category: 'Required', item_name: 'Flight cap', quantity: 1, notes: 'Silver/blue braiding, sex specific', amazon_search: 'air+force+flight+cap' },
  { category: 'Required', item_name: 'Blues necktie/tab', quantity: 1, notes: 'Sex specific', amazon_search: 'air+force+blues+tie' },
  { category: 'Required', item_name: 'Blue belt with chrome buckle', quantity: 1, amazon_search: 'air+force+blues+belt' },
  { category: 'Required', item_name: 'White V-neck undershirts', quantity: 2, notes: '3 recommended', amazon_search: 'white+v+neck+undershirt' },
  { category: 'Required', item_name: 'Black dress socks', quantity: 2, notes: '4 recommended', amazon_search: 'black+dress+socks' },
  { category: 'Required', item_name: 'Shirt garters', quantity: 1, amazon_search: 'military+shirt+garters' },
  { category: 'Required', item_name: 'Lightweight blue jacket', quantity: 1, notes: 'May be embroidered', amazon_search: 'air+force+lightweight+jacket' },
  
  // REQUIRED UNIFORMS - PT GEAR
  { category: 'Required', item_name: 'Running shoes', quantity: 1, notes: 'MUST be broken in! 2 pairs recommended', amazon_search: 'running+shoes' },
  { category: 'Required', item_name: 'PT shorts', quantity: 3, notes: 'IAW USAF/USSF regs, 5 recommended', amazon_search: 'air+force+pt+shorts' },
  { category: 'Required', item_name: 'PT shirts', quantity: 3, notes: 'IAW USAF/USSF regs, 5 recommended', amazon_search: 'air+force+pt+shirt' },
  { category: 'Required', item_name: 'PT pants', quantity: 1, notes: 'Running suit or sweats, 2 recommended', amazon_search: 'air+force+pt+pants' },
  { category: 'Required', item_name: 'PT jacket', quantity: 1, notes: 'Running suit or sweats, 2 recommended', amazon_search: 'air+force+pt+jacket' },
  { category: 'Required', item_name: 'PT socks', quantity: 5, notes: 'Per DAFI 36-2903, 7 recommended', amazon_search: 'white+athletic+socks' },
  
  // REQUIRED ACCOUTREMENTS
  { category: 'Required', item_name: 'Name tapes (1" wide)', quantity: 2, notes: 'Spice brown on OCP (or blue for USSF)', amazon_search: 'ocp+name+tape+custom' },
  { category: 'Required', item_name: 'USAF/USSF service tapes (1" wide)', quantity: 2, notes: 'Spice brown (or blue for USSF)', amazon_search: 'usaf+service+tape+ocp' },
  { category: 'Required', item_name: 'US Flag patch', quantity: 2, notes: 'Spice brown embroidered (full color for USSF)', amazon_search: 'ocp+us+flag+patch+spice+brown' },
  { category: 'Required', item_name: 'Velcro rank insignia', quantity: 2, notes: 'Spice brown embroidered (blue for USSF)', amazon_search: 'velcro+military+rank+insignia' },
  { category: 'Required', item_name: 'Blues name tag', quantity: 1, notes: 'Blue plastic', amazon_search: 'air+force+blues+name+tag' },
  { category: 'Required', item_name: 'Service dress name tag', quantity: 1, notes: 'Silver metal', amazon_search: 'air+force+service+dress+name+tag+silver' },
  { category: 'Required', item_name: 'US lapel pins', quantity: 1, notes: 'Set of 2 for service coat', amazon_search: 'us+lapel+pin+air+force' },
  { category: 'Required', item_name: 'Metal rank insignia', quantity: 3, notes: 'For service coat epaulet and flight cap', amazon_search: 'air+force+metal+rank+insignia' },
  { category: 'Required', item_name: 'Epaulet rank', quantity: 1, notes: 'Set of 2, sex specific', amazon_search: 'air+force+epaulet+rank' },
  { category: 'Required', item_name: 'Ribbon rack', quantity: 1, amazon_search: 'air+force+ribbon+rack' },
  
  // REQUIRED PERSONAL ITEMS
  { category: 'Required', item_name: 'Prescription medications', quantity: 1, notes: '90-day supply in original containers' },
  { category: 'Required', item_name: 'Washcloth', quantity: 2, amazon_search: 'washcloth' },
  { category: 'Required', item_name: 'Shower shoes/flip flops', quantity: 1, amazon_search: 'shower+sandals' },
  { category: 'Required', item_name: 'Hard soap with case or shower gel', quantity: 1, amazon_search: 'soap+case+travel' },
  { category: 'Required', item_name: 'Personal hygiene items', quantity: 1, notes: 'Shaving, hair, feminine supplies for 60 days', amazon_search: 'toiletry+kit' },
  { category: 'Required', item_name: 'Black backpack', quantity: 1, notes: 'IAW DAFI 36-2903, for 72-hour bag', amazon_search: 'black+tactical+backpack' },
  { category: 'Required', item_name: 'Hydration pack (1.5L minimum)', quantity: 1, notes: 'Max 18"x12"x5", must have document pouch', amazon_search: 'hydration+pack+camelbak' },
  { category: 'Required', item_name: 'Electrolytes', quantity: 1, notes: 'For hydration pack', amazon_search: 'electrolyte+powder+packets' },
  { category: 'Required', item_name: 'Black ball point pens', quantity: 5, amazon_search: 'black+ball+point+pens' },
  { category: 'Required', item_name: 'Notepaper/pocket notebook', quantity: 2, amazon_search: 'pocket+notebook+military' },
  { category: 'Required', item_name: 'Duffel bag', quantity: 1, notes: 'For field deployment', amazon_search: 'military+duffel+bag' },
  { category: 'Required', item_name: 'Toiletry bag', quantity: 1, amazon_search: 'toiletry+bag' },
  { category: 'Required', item_name: 'Towels', quantity: 2, notes: 'No wider than 24" x 44"', amazon_search: 'towel+24x44' },
  { category: 'Required', item_name: 'Wristwatch', quantity: 1, notes: 'Smart watches authorized with restrictions', amazon_search: 'military+watch' },
  { category: 'Required', item_name: 'Flashlight', quantity: 1, notes: 'Less than 5 inches long, extra batteries', amazon_search: 'tactical+flashlight+small' },
  { category: 'Required', item_name: 'Mouthguard', quantity: 1, notes: 'For combatives', amazon_search: 'sports+mouthguard' },
  { category: 'Required', item_name: 'Eye protection (wrap-around)', quantity: 1, notes: 'Must have fully enclosed sides', amazon_search: 'military+ballistic+glasses' },
  { category: 'Required', item_name: 'Prescription eyeglasses', quantity: 2, notes: 'If needed, military-approved frames' },
  { category: 'Required', item_name: 'Combination locks', quantity: 2, notes: 'TSA approved', amazon_search: 'combination+padlock+tsa' },
  { category: 'Required', item_name: 'Sandwich-sized ziplock bags', quantity: 5, notes: 'Clear', amazon_search: 'ziplock+sandwich+bags' },
  { category: 'Required', item_name: 'Cell phone and charger', quantity: 1, notes: 'Limited use restrictions' },
  { category: 'Required', item_name: 'Cash', quantity: 1, notes: 'At least $2,000 accessible, $65-75 exact cash for field meals' },
  
  // RECOMMENDED ITEMS
  { category: 'Recommended', item_name: 'Laptop with accessories', quantity: 1, notes: 'Surge protector, CAC reader, headphones', amazon_search: 'laptop+military' },
  { category: 'Recommended', item_name: 'Printer paper', quantity: 1, amazon_search: 'printer+paper' },
  { category: 'Recommended', item_name: 'Laundry bag', quantity: 1, amazon_search: 'mesh+laundry+bag' },
  { category: 'Recommended', item_name: 'Mesh laundry bag', quantity: 1, amazon_search: 'mesh+laundry+bag' },
  { category: 'Recommended', item_name: 'Starch', quantity: 1, notes: 'For uniforms', amazon_search: 'spray+starch' },
  { category: 'Recommended', item_name: 'Hangers', quantity: 10, amazon_search: 'plastic+hangers' },
  { category: 'Recommended', item_name: 'Laundry detergent', quantity: 1, amazon_search: 'laundry+detergent+pods' },
  { category: 'Recommended', item_name: 'Sewing kit', quantity: 1, amazon_search: 'sewing+kit+military' },
  { category: 'Recommended', item_name: 'Scissors', quantity: 1, amazon_search: 'small+scissors' },
  { category: 'Recommended', item_name: 'Lint roller', quantity: 1, amazon_search: 'lint+roller' },
  { category: 'Recommended', item_name: 'Eyeglass strap', quantity: 1, notes: 'To secure glasses during field events', amazon_search: 'eyeglass+strap+tactical' },
  { category: 'Recommended', item_name: 'Bug spray', quantity: 1, amazon_search: 'bug+spray+deet' },
  { category: 'Recommended', item_name: 'Sunscreen', quantity: 1, notes: 'SPF 30+', amazon_search: 'sunscreen+spf+50' },
  { category: 'Recommended', item_name: 'Blister prevention', quantity: 1, notes: 'Moleskin or similar', amazon_search: 'moleskin+blister+prevention' },
  { category: 'Recommended', item_name: 'Pain relief medication', quantity: 1, notes: 'Over-the-counter (Motrin, Tylenol)', amazon_search: 'ibuprofen+travel' },
  { category: 'Recommended', item_name: 'OCP fleece jacket', quantity: 1, notes: 'Coyote brown, for cold weather', amazon_search: 'ocp+fleece+jacket+coyote+brown' },
  { category: 'Recommended', item_name: 'Watch cap', quantity: 1, notes: 'Black or coyote brown, for cold weather', amazon_search: 'watch+cap+coyote+brown' },
  { category: 'Recommended', item_name: 'Gloves', quantity: 2, notes: '1 warm pair, 1 work pair (black or coyote brown)', amazon_search: 'tactical+gloves+coyote+brown' },
  { category: 'Recommended', item_name: 'OCP rain gear', quantity: 1, notes: 'All-Purpose Environmental Clothing System', amazon_search: 'ocp+rain+gear+apecs' },
  { category: 'Recommended', item_name: 'Religious items', quantity: 1, notes: 'Faith books, prayer mats, rosary, etc.' },
]

// Helper function to generate Amazon link
export function getAmazonLink(searchQuery: string): string {
  const associateId = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_ID || 'your-associate-20'
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${associateId}`
}
