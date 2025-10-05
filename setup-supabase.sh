#!/bin/bash

# Script pentru configurarea bazei de date Supabase
# Rulează acest script după ce ai completat .env.local cu credențialele tale

echo "🚀 Configurare bază de date Supabase..."

# Verifică dacă .env.local există
if [ ! -f .env.local ]; then
    echo "❌ Fișierul .env.local nu există!"
    echo "Copiază .env.example la .env.local și completează cu credențialele tale Supabase"
    exit 1
fi

# Generează clientul Prisma
echo "📦 Generare client Prisma..."
npx prisma generate

# Aplicarea migrărilor
echo "🔄 Aplicare migrări în Supabase..."
npx prisma db push

# Rulează seed-ul dacă există
if [ -f prisma/seed.ts ]; then
    echo "🌱 Populare bază de date cu date inițiale..."
    npm run db:seed
fi

echo "✅ Configurarea bazei de date Supabase a fost completată!"
echo "💡 Poți acum să rulezi aplicația cu: npm run dev"