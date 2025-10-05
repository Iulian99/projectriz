-- SQL pentru crearea tabelelor în Supabase SQL Editor

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  avatar VARCHAR,
  department VARCHAR,
  badge VARCHAR,
  position VARCHAR,
  "employeeCode" VARCHAR,
  unit VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  "birthDate" TIMESTAMPTZ,
  "hireDate" TIMESTAMPTZ,
  status VARCHAR DEFAULT 'active',
  "managerId" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "backgroundColor" VARCHAR DEFAULT '#f9fafb',
  "resetToken" VARCHAR,
  "resetTokenExpiry" TIMESTAMPTZ,
  FOREIGN KEY ("managerId") REFERENCES users(id)
);

-- Tabel Activities
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  activity VARCHAR NOT NULL,
  work VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'Completat',
  "userId" INTEGER NOT NULL,
  "baseAct" VARCHAR,
  attributes VARCHAR,
  complexity VARCHAR,
  "timeSpent" INTEGER,
  observations VARCHAR,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities("userId");
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);