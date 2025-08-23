-- Creating database setup script for Prisma
-- Run this after setting up your DATABASE_URL environment variable
-- This will create the users table for admin authentication

-- The Prisma schema will handle table creation
-- Just run: npm run db:push

-- Optional: Create your first admin user manually
-- INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt") 
-- VALUES (
--   'admin-' || generate_random_uuid()::text,
--   'admin@example.com',
--   '$2a$12$hash_your_password_here',
--   'Admin User',
--   'admin',
--   NOW(),
--   NOW()
-- );
