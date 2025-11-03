# OTS Packing List

A comprehensive packing list application for Officer Training School (OTS) candidates, built with Next.js and deployed on Vercel.

## Features

- Comprehensive OTS packing list with 40+ items across 7 categories
- Track packing progress with visual progress bar
- Category filtering
- "Buy on Amazon" buttons for purchasable items
- Data stored locally in browser (no account needed)
- Responsive design
- Reset and clear data options

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser localStorage
- **Deployment**: Vercel

## Setup Instructions

### Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) If you want Amazon affiliate commissions, create a `.env.local` file:
   ```
   NEXT_PUBLIC_AMAZON_ASSOCIATE_ID=your-associate-20
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. (Optional) Add environment variable if you have Amazon Associate ID:
   - `NEXT_PUBLIC_AMAZON_ASSOCIATE_ID=your-associate-20`
5. Click "Deploy"

Your app will be live at `your-project-name.vercel.app`

## Amazon Integration

The app includes "Buy on Amazon" buttons for purchasable items.

### Setting up Amazon Associates (Optional)

If you want to earn affiliate commissions:

1. Sign up for [Amazon Associates](https://affiliate-program.amazon.com)
2. Get your Associate ID (e.g., `yourname-20`)
3. Add it to your `.env.local` file or Vercel environment variables
4. Redeploy

If you don't set up an Associate ID, the links will still work but without affiliate tracking.

## Categories

- **Documentation** - IDs, certificates, paperwork
- **Civilian Clothing** - Business attire, underwear, socks
- **PT Gear** - Running shoes, athletic wear
- **Toiletries** - Personal hygiene items
- **Study Materials** - Pens, notebooks, locks
- **Financial** - Cash, cards
- **Electronics** - Phone, charger, laptop

## Data Storage

All data is stored in your browser's localStorage. This means:
- ✅ No account required
- ✅ Works offline
- ✅ Privacy-focused (data stays on your device)
- ⚠️ Data is tied to your browser - clearing browser data will reset your list
- ⚠️ Data won't sync across devices

## Usage

1. Open the app in your browser
2. Check off items as you pack them
3. Track your progress with the progress bar
4. Click "Buy" buttons to purchase items on Amazon
5. Filter by category to focus on specific sections
6. Use "Reset Checks" to uncheck all items
7. Use "Clear Data" to start fresh

## Notes

- The default packing list is based on standard OTS requirements
- Always verify requirements with your recruiting officer
- Requirements may change based on your specific OTS class and location

## Contributing

Feel free to submit issues or pull requests to improve the packing list or add features.

## License

MIT
