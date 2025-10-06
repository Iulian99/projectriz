# Configurare Supabase Dashboard - Nomenclatoare Servicii Publice

## � INSTRUCȚIUNI RAPIDE - START AICI!

**Pentru a crea rapid toate tabelele în Supabase:**
1. Deschide fișierul `supabase_complete_setup.sql` din rădăcina proiectului
2. Copiază tot conținutul fișierului  
3. Mergi în [Supabase Dashboard](https://supabase.com/dashboard) > SQL Editor
4. Lipește script-ul și apasă "Run"
5. ✅ Toate tabelele vor fi create automat cu date inițiale!

## �📋 Prezentare Generală

Această schemă de bază de date a fost proiectată pentru sistemele de management din serviciile publice și include toate nomenclatoarele necesare pentru gestionarea activităților, utilizatorilor și structurii organizaționale.

## 🚀 PRIMUL PAS: Crearea Tabelelor Existente

### **USERS** - Tabel utilizatori existent
```sql
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
```

### **ACTIVITIES** - Tabel activități existent
```sql
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
```

### **INDEXURI pentru performanță**
```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities("userId");
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
```

## 🏗️ Structura Tabelelor Nomenclatoare

### 1. **NOM_DIRECTIE** - Nomenclator Direcții

```sql
CREATE TABLE nom_directie (
    id SERIAL PRIMARY KEY,
    cod_dir VARCHAR(50) UNIQUE NOT NULL,
    denumire_dir VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **NOM_SERVICII** - Nomenclator Servicii

```sql
CREATE TABLE nom_servicii (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) UNIQUE NOT NULL,
    denumire_serv VARCHAR(255) NOT NULL,
    cod_dir VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_dir) REFERENCES nom_directie(cod_dir) ON DELETE CASCADE
);
```

### 3. **NOM_FUNCTII** - Nomenclator Funcții

```sql
CREATE TABLE nom_functii (
    id SERIAL PRIMARY KEY,
    cod_functie VARCHAR(50) UNIQUE NOT NULL,
    tip_functie VARCHAR(50) UNIQUE NOT NULL,
    denumire_functie VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **NOM_UTILIZATORI** - Utilizatori/Angajați

```sql
CREATE TABLE nom_utilizatori (
    id SERIAL PRIMARY KEY,
    cod_utilizator VARCHAR(50) UNIQUE NOT NULL,
    denumire_utilizator VARCHAR(255) NOT NULL,
    cod_functie VARCHAR(50) NOT NULL,
    numar_matricol VARCHAR(50),
    cod_serv VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    manager_id VARCHAR(50),
    background_color VARCHAR(7) DEFAULT '#f9fafb',
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_functie) REFERENCES nom_functii(cod_functie) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES nom_utilizatori(cod_utilizator)
);
```

### 5. **NOM_ATRIBUTII** - Atribuțiile Funcțiilor

```sql
CREATE TABLE nom_atributii (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) NOT NULL,
    tip_functie VARCHAR(50) NOT NULL,
    cod_atributie VARCHAR(50) NOT NULL,
    denumire_atributie TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    FOREIGN KEY (tip_functie) REFERENCES nom_functii(tip_functie) ON DELETE CASCADE,
    UNIQUE(cod_serv, tip_functie, cod_atributie)
);
```

### 6. **NOM_ACT_BAZA** - Acte Normative/Documente

```sql
CREATE TABLE nom_act_baza (
    id SERIAL PRIMARY KEY,
    cod_act VARCHAR(50) UNIQUE NOT NULL,
    denumire_act TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. **NOM_BUGET_TIMP** - Evidența Bugetului de Timp

```sql
CREATE TABLE nom_buget_timp (
    id SERIAL PRIMARY KEY,
    data_zi DATE NOT NULL,
    cod_utilizator VARCHAR(50) NOT NULL,
    minute INTEGER NOT NULL,
    cod_serv VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_utilizator) REFERENCES nom_utilizatori(cod_utilizator) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(data_zi, cod_utilizator, cod_serv)
);
```

### 8. **NOM_CALENDAR** - Calendar Zile Lucrătoare/Nelucrătoare

```sql
CREATE TABLE nom_calendar (
    id SERIAL PRIMARY KEY,
    data_zi DATE UNIQUE NOT NULL,
    tip_zi VARCHAR(20) NOT NULL, -- 'lucratoare' sau 'nelucratoare'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. **NOM_LUCRARI** - Nomenclator Lucrări/Aplicații

```sql
CREATE TABLE nom_lucrari (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) NOT NULL,
    cod_lucrare VARCHAR(50) NOT NULL,
    denumire_lucrare VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(cod_serv, cod_lucrare)
);
```

### 10. **NOM_ROF** - Regulament de Organizare și Funcționare

```sql
CREATE TABLE nom_rof (
    id SERIAL PRIMARY KEY,
    cod_dir VARCHAR(50) NOT NULL,
    cod_serv VARCHAR(50) NOT NULL,
    cod_rof VARCHAR(50) NOT NULL,
    denumire_rof TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cod_dir) REFERENCES nom_directie(cod_dir) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(cod_dir, cod_serv, cod_rof)
);
```

## 🔧 Pași pentru Configurarea în Supabase Dashboard

### 1. **Accesarea SQL Editor**
- Logați-vă în [Supabase Dashboard](https://supabase.com/dashboard)
- Selectați proiectul vostru
- Mergeți la secțiunea **SQL Editor**

### 2. **Executarea Script-ului Complet** ⚡ METODA RECOMANDATĂ
- Deschideți fișierul `supabase_complete_setup.sql` din rădăcina proiectului
- Copiați întreg conținutul fișierului
- Lipește în SQL Editor și executați
- **AVANTAJE**: Toate tabelele, indexurile și datele inițiale vor fi create automat

### 3. **ALTERNATIV: Executarea Script-urilor SQL Individual**
- Copiați și executați fiecare script SQL de mai sus în ordinea indicată
- **IMPORTANT**: Respectați ordinea pentru a evita erorile de foreign key

### 4. **Verificarea Tabelelor**
- Mergeți la secțiunea **Table Editor**
- Verificați că toate tabelele au fost create cu succes:
  - `users` ✅
  - `activities` ✅
  - `nom_directie` ✅
  - `nom_servicii` ✅
  - `nom_functii` ✅
  - `nom_utilizatori` ✅
  - `nom_atributii` ✅
  - `nom_act_baza` ✅
  - `nom_buget_timp` ✅
  - `nom_calendar` ✅
  - `nom_lucrari` ✅
  - `nom_rof` ✅
- Verificați relațiile foreign key

### 4. **Configurarea RLS (Row Level Security)**

```sql
-- Exemplu pentru tabela nom_utilizatori
ALTER TABLE nom_utilizatori ENABLE ROW LEVEL SECURITY;

-- Policy pentru utilizatori autentificați
CREATE POLICY "Users can view own data" ON nom_utilizatori
    FOR SELECT USING (auth.uid()::text = cod_utilizator);

CREATE POLICY "Users can update own data" ON nom_utilizatori
    FOR UPDATE USING (auth.uid()::text = cod_utilizator);
```

### 5. **Popularea cu Date Inițiale**

#### Date pentru NOM_DIRECTIE:

```sql
INSERT INTO nom_directie (cod_dir, denumire_dir) VALUES
('DIR001', 'Direcția Generală'),
('DIR002', 'Direcția IT'),
('DIR003', 'Direcția Resurse Umane'),
('DIR004', 'Direcția Financiară');
```

#### Date pentru NOM_SERVICII:

```sql
INSERT INTO nom_servicii (cod_serv, denumire_serv, cod_dir) VALUES
('SERV001', 'Serviciul Dezvoltare Software', 'DIR002'),
('SERV002', 'Serviciul Infrastructură IT', 'DIR002'),
('SERV003', 'Serviciul Personal', 'DIR003'),
('SERV004', 'Serviciul Contabilitate', 'DIR004');
```

#### Date pentru NOM_FUNCTII:

```sql
INSERT INTO nom_functii (cod_functie, tip_functie, denumire_functie) VALUES
('FUNC001', 'MANAGER', 'Manager de Departament'),
('FUNC002', 'DEV', 'Dezvoltator Software'),
('FUNC003', 'ADMIN', 'Administrator Sistem'),
('FUNC004', 'CONT', 'Contabil');
```

#### Date pentru NOM_CALENDAR:

```sql
-- Populare calendar pentru anul 2025 (exemplu pentru ianuarie)
INSERT INTO nom_calendar (data_zi, tip_zi) VALUES
('2025-01-01', 'nelucratoare'),
('2025-01-02', 'nelucratoare'),
('2025-01-03', 'lucratoare'),
('2025-01-04', 'lucratoare'),
-- ... continuați pentru toate zilele anului
```

## 🛡️ Configurări de Securitate

### 1. **Activarea Authentication**

- Mergeți la **Authentication > Settings**
- Configurați providerii de autentificare dorite
- Setați redirect URLs pentru aplicația voastră

### 2. **Configurarea API Keys**

- **Anon Key**: Pentru accesul public (cu RLS)
- **Service Role Key**: Pentru operațiuni admin (folosiți cu atenție)

### 3. **Setarea Politicilor RLS**

- Creați politici specifice pentru fiecare rol
- Testați politicile înainte de deploy în producție

## 📊 Monitorizare și Optimizare

### 1. **Dashboard Metrics**

- Monitorizați usage-ul în secțiunea **Logs**
- Verificați performanța query-urilor în **SQL Editor**

### 2. **Backup și Recovery**

- Configurați backup-uri automate
- Testați procesul de recovery

### 3. **Scaling**

- Monitorizați limele de utilizare
- Configurați alertele pentru thresholds

## 🔗 Integrarea cu Aplicația Next.js

### 1. **Actualizarea Environment Variables**

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 2. **Rularea Migrărilor Prisma**

```bash
npx prisma db push
npx prisma generate
```

### 3. **Testarea Conexiunii**

```bash
npx prisma studio
```

## ✅ Checklist Final

- [ ] Toate tabelele au fost create cu succes
- [ ] Relațiile foreign key sunt configurate corect
- [ ] RLS este activat pe tabelele sensibile
- [ ] Politicile de securitate sunt implementate
- [ ] Date inițiale sunt populate
- [ ] Backup-ul este configurat
- [ ] Aplicația se conectează cu succes
- [ ] Testele de funcționalitate trec

## 🆘 Troubleshooting

### Probleme Comune:

1. **Eroare Foreign Key**: Verificați ordinea creării tabelelor
2. **Eroare RLS**: Verificați că utilizatorul are permisiunile corecte
3. **Conexiune refuzată**: Verificați firewall-ul și IP allowlist

### Support:

- [Documentația Supabase](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Community Forum](https://github.com/supabase/supabase/discussions)
