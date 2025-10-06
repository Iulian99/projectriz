-- Tabel Users (utilizatori aplicație)
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

-- Tabel Activities (activități utilizatori)
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

-- ====================================================================
-- AL DOILEA PAS: NOMENCLATOARELE PENTRU SERVICII PUBLICE
-- ====================================================================

-- 1. Nomenclator Direcții
CREATE TABLE IF NOT EXISTS nom_directie (
    id SERIAL PRIMARY KEY,
    cod_dir VARCHAR(50) UNIQUE NOT NULL,
    denumire_dir VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Nomenclator Servicii
CREATE TABLE IF NOT EXISTS nom_servicii (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) UNIQUE NOT NULL,
    denumire_serv VARCHAR(255) NOT NULL,
    cod_dir VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_dir) REFERENCES nom_directie(cod_dir) ON DELETE CASCADE
);

-- 3. Nomenclator Funcții
CREATE TABLE IF NOT EXISTS nom_functii (
    id SERIAL PRIMARY KEY,
    cod_functie VARCHAR(50) UNIQUE NOT NULL,
    tip_functie VARCHAR(50) UNIQUE NOT NULL,
    denumire_functie VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Nomenclator Utilizatori/Angajați
CREATE TABLE IF NOT EXISTS nom_utilizatori (
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
    reset_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_functie) REFERENCES nom_functii(cod_functie) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES nom_utilizatori(cod_utilizator)
);

-- 5. Nomenclator Atribuțiile Funcțiilor
CREATE TABLE IF NOT EXISTS nom_atributii (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) NOT NULL,
    tip_functie VARCHAR(50) NOT NULL,
    cod_atributie VARCHAR(50) NOT NULL,
    denumire_atributie TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    FOREIGN KEY (tip_functie) REFERENCES nom_functii(tip_functie) ON DELETE CASCADE,
    UNIQUE(cod_serv, tip_functie, cod_atributie)
);

-- 6. Nomenclator Acte Normative/Documente
CREATE TABLE IF NOT EXISTS nom_act_baza (
    id SERIAL PRIMARY KEY,
    cod_act VARCHAR(50) UNIQUE NOT NULL,
    denumire_act TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Evidența Bugetului de Timp
CREATE TABLE IF NOT EXISTS nom_buget_timp (
    id SERIAL PRIMARY KEY,
    data_zi DATE NOT NULL,
    cod_utilizator VARCHAR(50) NOT NULL,
    minute INTEGER NOT NULL,
    cod_serv VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_utilizator) REFERENCES nom_utilizatori(cod_utilizator) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(data_zi, cod_utilizator, cod_serv)
);

-- 8. Calendar Zile Lucrătoare/Nelucrătoare
CREATE TABLE IF NOT EXISTS nom_calendar (
    id SERIAL PRIMARY KEY,
    data_zi DATE UNIQUE NOT NULL,
    tip_zi VARCHAR(20) NOT NULL, -- 'lucratoare' sau 'nelucratoare'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Nomenclator Lucrări/Aplicații
CREATE TABLE IF NOT EXISTS nom_lucrari (
    id SERIAL PRIMARY KEY,
    cod_serv VARCHAR(50) NOT NULL,
    cod_lucrare VARCHAR(50) NOT NULL,
    denumire_lucrare VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(cod_serv, cod_lucrare)
);

-- 10. Regulament de Organizare și Funcționare
CREATE TABLE IF NOT EXISTS nom_rof (
    id SERIAL PRIMARY KEY,
    cod_dir VARCHAR(50) NOT NULL,
    cod_serv VARCHAR(50) NOT NULL,
    cod_rof VARCHAR(50) NOT NULL,
    denumire_rof TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (cod_dir) REFERENCES nom_directie(cod_dir) ON DELETE CASCADE,
    FOREIGN KEY (cod_serv) REFERENCES nom_servicii(cod_serv) ON DELETE CASCADE,
    UNIQUE(cod_dir, cod_serv, cod_rof)
);

-- ====================================================================
-- AL TREILEA PAS: INDEXURI PENTRU PERFORMANȚĂ
-- ====================================================================

-- Indexuri pentru tabelele existente
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities("userId");
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);

-- Indexuri pentru nomenclatoare
CREATE INDEX IF NOT EXISTS idx_nom_servicii_cod_dir ON nom_servicii(cod_dir);
CREATE INDEX IF NOT EXISTS idx_nom_utilizatori_cod_functie ON nom_utilizatori(cod_functie);
CREATE INDEX IF NOT EXISTS idx_nom_utilizatori_cod_serv ON nom_utilizatori(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_atributii_cod_serv ON nom_atributii(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_atributii_tip_functie ON nom_atributii(tip_functie);
CREATE INDEX IF NOT EXISTS idx_nom_buget_timp_data_zi ON nom_buget_timp(data_zi);
CREATE INDEX IF NOT EXISTS idx_nom_buget_timp_cod_utilizator ON nom_buget_timp(cod_utilizator);
CREATE INDEX IF NOT EXISTS idx_nom_calendar_data_zi ON nom_calendar(data_zi);
CREATE INDEX IF NOT EXISTS idx_nom_lucrari_cod_serv ON nom_lucrari(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_rof_cod_dir ON nom_rof(cod_dir);
CREATE INDEX IF NOT EXISTS idx_nom_rof_cod_serv ON nom_rof(cod_serv);

-- ====================================================================
-- AL PATRULEA PAS: DATE INIȚIALE PENTRU TESTARE
-- ====================================================================

-- Date pentru nomenclator direcții
INSERT INTO nom_directie (cod_dir, denumire_dir) VALUES
('DIR001', 'Direcția Generală'),
('DIR002', 'Direcția IT'),
('DIR003', 'Direcția Resurse Umane'),
('DIR004', 'Direcția Financiară'),
('DIR005', 'Direcția Juridică')
ON CONFLICT (cod_dir) DO NOTHING;

-- Date pentru nomenclator servicii
INSERT INTO nom_servicii (cod_serv, denumire_serv, cod_dir) VALUES
('SERV001', 'Serviciul Dezvoltare Software', 'DIR002'),
('SERV002', 'Serviciul Infrastructură IT', 'DIR002'),
('SERV003', 'Serviciul Administrare Sistem', 'DIR002'),
('SERV004', 'Serviciul Personal', 'DIR003'),
('SERV005', 'Serviciul Formare Profesională', 'DIR003'),
('SERV006', 'Serviciul Contabilitate', 'DIR004'),
('SERV007', 'Serviciul Achiziții', 'DIR004'),
('SERV008', 'Serviciul Contencios', 'DIR005'),
('SERV009', 'Serviciul Avizare Juridică', 'DIR005')
ON CONFLICT (cod_serv) DO NOTHING;

-- Date pentru nomenclator funcții
INSERT INTO nom_functii (cod_functie, tip_functie, denumire_functie) VALUES
('FUNC001', 'MANAGER', 'Manager de Departament'),
('FUNC002', 'DEV_SENIOR', 'Dezvoltator Software Senior'),
('FUNC003', 'DEV_JUNIOR', 'Dezvoltator Software Junior'),
('FUNC004', 'ADMIN_SYS', 'Administrator Sistem'),
('FUNC005', 'ADMIN_DB', 'Administrator Baze de Date'),
('FUNC006', 'SPEC_RU', 'Specialist Resurse Umane'),
('FUNC007', 'CONT_SEF', 'Contabil Șef'),
('FUNC008', 'CONT', 'Contabil'),
('FUNC009', 'JURIST', 'Consilier Juridic'),
('FUNC010', 'REFERENT', 'Referent de Specialitate')
ON CONFLICT (cod_functie) DO NOTHING;

-- Calendar pentru câteva zile din octombrie 2025 (exemplu)
INSERT INTO nom_calendar (data_zi, tip_zi) VALUES
('2025-10-01', 'lucratoare'),
('2025-10-02', 'lucratoare'),
('2025-10-03', 'lucratoare'),
('2025-10-04', 'lucratoare'),
('2025-10-05', 'nelucratoare'),
('2025-10-06', 'nelucratoare'),
('2025-10-07', 'lucratoare'),
('2025-10-08', 'lucratoare'),
('2025-10-09', 'lucratoare'),
('2025-10-10', 'lucratoare'),
('2025-10-11', 'lucratoare'),
('2025-10-12', 'nelucratoare'),
('2025-10-13', 'nelucratoare')
ON CONFLICT (data_zi) DO NOTHING;

-- ====================================================================
-- VERIFICARE FINALĂ
-- ====================================================================

-- Verifică că toate tabelele au fost create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verifică constrainturile de foreign key
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ====================================================================
-- MESAJ DE CONFIRMARE
-- ====================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ TOATE TABELELE AU FOST CREATE CU SUCCES!';
    RAISE NOTICE '📊 Verifică în Table Editor că toate tabelele sunt prezente.';
    RAISE NOTICE '🔐 Următorul pas: configurarea RLS (Row Level Security) dacă este necesar.';
END $$;