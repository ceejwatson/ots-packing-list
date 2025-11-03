# OTS Packing List

A comprehensive packing list application for Officer Training School (OTS) candidates, built with Next.js, Supabase, and deployed on Vercel.

## Features

- User authentication with Supabase
- Comprehensive OTS packing list with categories
- Track packing progress
- Persistent data storage
- Responsive design
- Real-time updates

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication & Database**: Supabase
- **Deployment**: Vercel

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Project Settings > API
3. Copy your project URL and anon/public key
4. Go to the SQL Editor in Supabase
5. Run the SQL from `supabase-schema.sql` to create the database schema

### 2. Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### 3. Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

Your app will be live at `your-project-name.vercel.app`

## Database Schema

The application uses a single table `packing_items` with the following structure:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `category`: TEXT (e.g., "Documentation", "Toiletries")
- `item_name`: TEXT
- `quantity`: INTEGER
- `is_packed`: BOOLEAN
- `notes`: TEXT (optional)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## Default Categories

- Documentation
- Civilian Clothing
- PT Gear
- Toiletries
- Study Materials
- Financial
- Electronics

## Usage

1. Sign up with your email and password
2. The app will automatically initialize with a comprehensive OTS packing list
3. Check off items as you pack them
4. Track your progress with the progress bar
5. Filter by category to focus on specific sections

## Notes

- The default packing list is based on standard OTS requirements
- Always verify requirements with your recruiting officer
- Requirements may change based on your specific OTS class and location
- You can customize the list by modifying `lib/packing-list-data.ts`

## Contributing

Feel free to submit issues or pull requests to improve the packing list or add features.

## License

MIT
