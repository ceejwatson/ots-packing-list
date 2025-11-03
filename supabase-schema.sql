-- Create packing_items table
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_packed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  amazon_search TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_packing_items_user_id ON packing_items(user_id);

-- Enable Row Level Security
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own items"
  ON packing_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON packing_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON packing_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON packing_items FOR DELETE
  USING (auth.uid() = user_id);

-- Migration: Add amazon_search column to existing table (if needed)
-- Run this if you already created the table without amazon_search
-- ALTER TABLE packing_items ADD COLUMN IF NOT EXISTS amazon_search TEXT;
