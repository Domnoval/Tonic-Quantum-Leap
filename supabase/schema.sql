-- Forge Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (creators who want payouts)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  stripe_connect_id VARCHAR(255),
  payout_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- All generated images
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- for anonymous users

  -- Generation details
  mode VARCHAR(50) NOT NULL, -- style, remix, inpaint, mashup, collage
  source_images TEXT[] NOT NULL,
  prompt TEXT,
  settings JSONB, -- creativity, chaos, seed, etc.

  -- Result
  result_url VARCHAR(500),
  thumbnail_url VARCHAR(500),

  -- Metadata
  transmission_number SERIAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases (unlocks Hall submission)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE NOT NULL,

  -- Printful
  printful_order_id VARCHAR(255),
  product_type VARCHAR(100), -- poster_12x18, canvas_16x20, etc.

  -- Payment
  amount_cents INTEGER NOT NULL,
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, delivered, failed

  -- Hall unlock
  hall_submission_unlocked BOOLEAN DEFAULT FALSE,
  hall_submission_used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hall of Transmissions (community gallery)
CREATE TABLE IF NOT EXISTS hall_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,

  -- Display info
  title VARCHAR(200),
  description TEXT,

  -- Pricing (set by creator)
  price_cents INTEGER NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  featured BOOLEAN DEFAULT FALSE,

  -- Stats
  view_count INTEGER DEFAULT 0,

  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales from Hall pieces
CREATE TABLE IF NOT EXISTS hall_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES hall_submissions(id) ON DELETE CASCADE NOT NULL,

  -- Buyer
  buyer_email VARCHAR(255) NOT NULL,

  -- Printful
  printful_order_id VARCHAR(255),
  product_type VARCHAR(100),

  -- Money split
  total_cents INTEGER NOT NULL,
  creator_cut_cents INTEGER NOT NULL, -- 50%
  platform_cut_cents INTEGER NOT NULL, -- 50%

  stripe_payment_id VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout tracking
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,

  stripe_transfer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_session_id ON generations(session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_generation_id ON purchases(generation_id);
CREATE INDEX IF NOT EXISTS idx_hall_submissions_user_id ON hall_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_hall_submissions_status ON hall_submissions(status);
CREATE INDEX IF NOT EXISTS idx_hall_sales_submission_id ON hall_sales(submission_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Generations: users can see their own, anyone can see by session_id
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Anyone can insert generations" ON generations
  FOR INSERT WITH CHECK (true);

-- Purchases: users can see their own
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Hall submissions: approved ones are public
CREATE POLICY "Anyone can view approved submissions" ON hall_submissions
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own submissions" ON hall_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON hall_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payouts: users can see their own
CREATE POLICY "Users can view own payouts" ON payouts
  FOR SELECT USING (auth.uid() = user_id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
