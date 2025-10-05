import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://hbvdyzlndibplozogrmp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidmR5emxuZGlicGxvem9ncm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjM4NzUsImV4cCI6MjA3NTIzOTg3NX0.UAGkghi0haGWNem7qT1o6STU7j_gYtBYWMYQRu6ckjA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addNewUsers() {
  console.log('👥 Adăugare utilizatori noi în Supabase...')
  
  try {
    // Lista utilizatorilor de adăugat
    const newUsers = [
      {
        identifier: 'maria.popescu',
        email: 'maria.popescu@projectriz.com',
        name: 'Maria Popescu',
        role: 'user',
        department: 'Contabilitate',
        position: 'Contabil Senior'
      },
      {
        identifier: 'ion.ionescu',
        email: 'ion.ionescu@projectriz.com', 
        name: 'Ion Ionescu',
        role: 'manager',
        department: 'IT',
        position: 'Team Lead IT'
      },
      {
        identifier: 'ana.mihai',
        email: 'ana.mihai@projectriz.com',
        name: 'Ana Mihai',
        role: 'user', 
        department: 'Resurse Umane',
        position: 'Specialist HR'
      }
    ]

    // Hash pentru parolă (123456 pentru toți)
    const hashedPassword = await bcrypt.hash('123456', 10)

    for (const userData of newUsers) {
      const userWithPassword = {
        ...userData,
        password: hashedPassword
      }

      console.log(`👤 Creez utilizatorul: ${userData.name}...`)
      
      const { data, error } = await supabase
        .from('users')
        .insert([userWithPassword])
        .select()

      if (error) {
        if (error.message.includes('duplicate')) {
          console.log(`⚠️  Utilizatorul ${userData.identifier} există deja`)
        } else {
          console.log(`❌ Eroare la ${userData.identifier}:`, error.message)
        }
      } else {
        console.log(`✅ ${userData.name} creat cu succes!`)
        console.log(`📧 Email: ${userData.email}`)
        console.log(`🔑 Parolă: 123456`)
        console.log('---')
      }
    }

    // Afișează toți utilizatorii
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, department, position')
      .order('id')

    if (fetchError) {
      console.log('❌ Eroare la afișarea utilizatorilor:', fetchError.message)
    } else {
      console.log('\n📊 Toți utilizatorii din sistem:')
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
        console.log(`   Role: ${user.role} | Department: ${user.department}`)
        console.log(`   Position: ${user.position || 'N/A'}`)
        console.log('')
      })
    }

    console.log('🎉 Procesul de adăugare utilizatori completat!')
    
  } catch (error) {
    console.error('❌ Eroare generală:', error.message)
  }
}

addNewUsers()