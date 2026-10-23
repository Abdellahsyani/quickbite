-- Keep contact details nullable for restaurants registered before this migration.
ALTER TABLE "restaurants"
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT;
