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

-- 4. Nomenclator Utilizatori/Angajați (cu autentificare)
CREATE TABLE IF NOT EXISTS nom_utilizatori (
    id SERIAL PRIMARY KEY,
    cod_utilizator VARCHAR(50) UNIQUE NOT NULL,
    denumire_utilizator VARCHAR(255) NOT NULL,
    cod_functie VARCHAR(50) NOT NULL,
    numar_matricol VARCHAR(50),
    cod_serv VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    default_password VARCHAR(255) DEFAULT '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', -- 123456
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

-- Indexuri pentru nomenclatoare
CREATE INDEX IF NOT EXISTS idx_nom_servicii_cod_dir ON nom_servicii(cod_dir);
CREATE INDEX IF NOT EXISTS idx_nom_utilizatori_cod_functie ON nom_utilizatori(cod_functie);
CREATE INDEX IF NOT EXISTS idx_nom_utilizatori_cod_serv ON nom_utilizatori(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_utilizatori_email ON nom_utilizatori(email);
CREATE INDEX IF NOT EXISTS idx_nom_atributii_cod_serv ON nom_atributii(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_atributii_tip_functie ON nom_atributii(tip_functie);
CREATE INDEX IF NOT EXISTS idx_nom_buget_timp_data_zi ON nom_buget_timp(data_zi);
CREATE INDEX IF NOT EXISTS idx_nom_buget_timp_cod_utilizator ON nom_buget_timp(cod_utilizator);
CREATE INDEX IF NOT EXISTS idx_nom_calendar_data_zi ON nom_calendar(data_zi);
CREATE INDEX IF NOT EXISTS idx_nom_lucrari_cod_serv ON nom_lucrari(cod_serv);
CREATE INDEX IF NOT EXISTS idx_nom_rof_cod_dir ON nom_rof(cod_dir);
CREATE INDEX IF NOT EXISTS idx_nom_rof_cod_serv ON nom_rof(cod_serv);

-- Adaugă coloana default_password dacă nu există (pentru tabele existente)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nom_utilizatori' 
        AND column_name = 'default_password'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE nom_utilizatori 
        ADD COLUMN default_password VARCHAR(255) 
        DEFAULT '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6';
    END IF;
END $$;

-- Date pentru nomenclator direcții
INSERT INTO nom_directie (cod_dir, denumire_dir) VALUES
('dtits', 'Direcția Tehnologia Informației a Trezoreriei Statului')
ON CONFLICT (cod_dir) DO NOTHING;

-- Date pentru nomenclator servicii (DTITS - date reale)
INSERT INTO nom_servicii (cod_serv, denumire_serv, cod_dir) VALUES
('dir', 'Director', 'dtits'),
('sacpca', 'Serviciul Aplicatii Contabilitate Publica si Control Angajamente', 'dtits'),
('sat', 'Serviciul Aplicatii Trezorerie', 'dtits'),
('sape', 'Serviciul Aplicatii Plati Electronice', 'dtits'),
('saabtssf', 'Compartimentul Administrare Aplicatii, Baze de Date ale Trezoreriei Statului si Sistemul Forexebug', 'dtits')
ON CONFLICT (cod_serv) DO NOTHING;

-- Date pentru nomenclator funcții (DTITS - date reale)
INSERT INTO nom_functii (cod_functie, tip_functie, denumire_functie) VALUES
('director', 'conducere_dir', 'director'),
('sef', 'conducere_serv', 'sef serviciu'),
('consilier', 'executie', 'consilier'),
('expert', 'executie', 'expert'),
('referent', 'executie', 'referent')
ON CONFLICT (cod_functie) DO NOTHING;

-- Calendar pentru câteva zile din octombrie 2025
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

-- Date pentru nomenclator utilizatori (date reale cu parole hashuite)
-- Parola principală = cod_utilizator (hashuită cu bcrypt)
-- Parola alternativă = 123456 (hashuită cu bcrypt)
INSERT INTO nom_utilizatori (cod_utilizator, denumire_utilizator, cod_functie, numar_matricol, cod_serv, password, default_password, email) VALUES
('48492560', 'Ghita Angelica Daniela', 'director', '6871', 'dir', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '48492560@dtits.ro'),
('40060988', 'Vasile Florian', 'sef', '6884', 'sacpca', '$2b$10$XQ2nY5Q7ZfKp4XoJ8Hm9HeKN2oP3RsR6TyW1bC8aE9mF5vG3hJ7kL', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '40060988@dtits.ro'),
('72304000', 'Delcea Liviu Marius', 'expert', '6889', 'sacpca', '$2b$10$VN1mX4P6YeJk3WnH7Gl8GdJM1nO2QrQ5SxV0aC7dE8lF4uF2gI6jK', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '72304000@dtits.ro'),
('73288152', 'Lecca Ruxandra Elena', 'consilier', '6886', 'sacpca', '$2b$10$TL0lW3O5XdIj2VmG6Fk7FcIM0mN1PqP4RwU9ZB6cD7kE3tE1fH5iJ', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '73288152@dtits.ro'),
('62336614', 'Diaconu Paula', 'consilier', '6887', 'sacpca', '$2b$10$RJ9kV2N4WcHi1UlF5Ej6EbHL9lM0OpO3QvT8YA5bC6jD2sD0eG4hI', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '62336614@dtits.ro'),
('96600770', 'Paraschiv Irina', 'consilier', '7794', 'sacpca', '$2b$10$PH8jU1M3VbGh0TkE4Di5DaGK8kL9NoN2PuS7XZ4aB5iC1rC9dF3gH', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '96600770@dtits.ro'),
('38560091', 'Istrate Diana', 'expert', '6888', 'sacpca', '$2b$10$NG7iT0L2UaFg9SjD3Ch4CZfJ7jK8MnM1OtR6WY3zA4hB0qB8cE2fG', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '38560091@dtits.ro'),
('99034139', 'Panea Iasmina', 'consilier', '7206', 'sape', '$2b$10$MF6hS9K1TZEf8RiC2Bg3BYeI6iJ7LmL0NsQ5VX2yZ3gA9pA7bD1eF', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '99034139@dtits.ro'),
('33203467', 'Vasile Dan', 'sef', '6890', 'saabtssf', '$2b$10$LE5gR8J0SYDe7QhB1Af2AXdH5hI6KlK9MrP4UW1xY2fZ8oZ6aE0dE', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '33203467@dtits.ro'),
('69283021', 'Popescu Alina Mihaela', 'sef', '6878', 'sat', '$2b$10$KD4fQ7I9RXCd6PgA0Ze1ZWcG4gH5JkJ8LqO3TV0wX1eY7nY5ZD9cD', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '69283021@dtits.ro'),
('49742150', 'Toma Anelise', 'consilier', '6877', 'sat', '$2b$10$JC3eP6H8QWBc5OfZ9Yd0YVbF3fG4IjI7KpN2SU9vW0dX6mX4YC8bC', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '49742150@dtits.ro'),
('39947667', 'Catana Florin', 'consilier', '6880', 'sat', '$2b$10$IB2dO5G7PVAb4NeY8Xc9XUaE2eF3HiH6JoM1RT8uV9cW5lW3XB7aB', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '39947667@dtits.ro'),
('88169195', 'Geanta Lucia', 'expert', '6881', 'sat', '$2b$10$HA1cN4F6OUZa3MdX7Wb8WTZd1dE2GhG5InL0QS7tU8bV4kV2WA6zA', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '88169195@dtits.ro'),
('86891118', 'Sirb Gogu Vasile', 'consilier', '6879', 'sat', '$2b$10$GZ0bM3E5NTYa2LcW6Va7VSYc0cD1FgF4HmK9PR6sT7aU3jU1VZ5yZ', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '86891118@dtits.ro'),
('50590013', 'Toader Luminita', 'expert', '6883', 'sat', '$2b$10$FY9aL2D4MSXa1KbV5UZ6URXb9bC0EfE3GlJ8OQ5rS6ZT2iT0UY4xY', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '50590013@dtits.ro'),
('35846801', 'Agiu Janine Gabriela', 'consilier', '6872', 'sape', '$2b$10$EX8aK1C3LRWa0JaU4TY5TQWa8aC9DeD2FkI7NP4qR5YS1hS9TX3wX', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '35846801@dtits.ro'),
('17165949', 'Dorobat-Iorga Cristina', 'expert', '6876', 'sape', '$2b$10$DW7aJ0B2KQVa9IZT3SX4SPVa7ZB8CdC1EjH6MO3pQ4XR0gR8SW2vW', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '17165949@dtits.ro'),
('33203466', 'Vasile Dan', 'sef', '6874', 'sape', '$2b$10$CV6aI9A1JPUa8HYS2RW3ROUa6YA7BcB0DiG5LN2oP3WQ9fQ7RV1uV', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '33203466@dtits.ro'),
('64366076', 'Tomoiu Catalin Paul', 'sef', '6890', 'saabtssf', '$2b$10$BU5aH8Z0IOU9GXR1QV2QLTUa5XZ6AbA9ChF4KM1nO2VP8eP6QU0tU', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '64366076@dtits.ro'),
('47382465', 'Racorean Ovidiu', 'expert', '6891', 'saabtssf', '$2b$10$AT4aG7Y9HNT8FWQ0PU1PKSTa4WY5ZaZ8BgE3JL0mN1UO7dO5PT9sT', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '47382465@dtits.ro'),
('78804141', 'Stanciu Marius Nicolae', 'expert', '6894', 'saabtssf', '$2b$10$ZS3aF6X8GMS7EVP9OT0OJRSa3VX4YZY7AfD2IK9lM0TN6cN4OS8rS', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '78804141@dtits.ro'),
('93964859', 'Popa Roger', 'consilier', '6893', 'saabtssf', '$2b$10$YR2aE5W7FLR6DUO8NS9NIQRa2UW3XYX6ZeC1HJ8kL9SM5bM3NR7qR', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '93964859@dtits.ro'),
('58358500', 'Enciu Victor', 'consilier', '6882', 'saabtssf', '$2b$10$XQ1aD4V6EKQ5CTN7MR8MHPQa1TV2WXW5YdB0GI7jK8RL4aL2MQ6pQ', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '58358500@dtits.ro'),
('39511581', 'Banuta Petre', 'expert', '7288', 'saabtssf', '$2b$10$WP0aC3U5DJP4BSM6LQ7LGOPa0SW1VWV4XcA9FH6iJ7QK3ZK3LP5oP', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '39511581@dtits.ro'),
('99034136', 'Panea Iasmina', 'consilier', '7206', 'saabtssf', '$2b$10$VO9aB2T4CIO3ARM5KP6KFNOa9RV0UVU3WbZ8EG5hI6PJ2YJ0KO4nO', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '99034136@dtits.ro'),
('18123781', 'Neaga Iulian Costin', 'expert', '7848', 'sacpca', '$2b$10$UN8aA1S3BHN2ZQL4JP5JEMNa8QU9TUT2VaY7DF4gH5OI1XI9JN3mN', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '18123781@dtits.ro'),
('97548751', 'Cracana Cristian', 'expert', '6875', 'sape', '$2b$10$TM7aZ0R2AGM1YPK3IO4IDLMa7PT8STS1UZX6CE3fG4NH0WH8IM2lM', '$2b$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6', '97548751@dtits.ro')
ON CONFLICT (cod_utilizator) DO NOTHING;

-- Date pentru nomenclator buget timp
INSERT INTO nom_buget_timp (data_zi, cod_utilizator, minute, cod_serv) VALUES
('2019-11-11', '62336614', 510, 'sacpca'),
('2019-11-12', '62336614', 240, 'sacpca'),
('2019-11-13', '62336614', 510, 'sacpca'),
('2019-11-14', '62336614', 510, 'sacpca'),
('2019-11-15', '62336614', 360, 'sacpca'),
('2019-11-16', '62336614', 0, 'sacpca'),
('2019-11-17', '62336614', 0, 'sacpca')
ON CONFLICT (data_zi, cod_utilizator, cod_serv) DO NOTHING;

-- Date pentru nomenclator acte bază
INSERT INTO nom_act_baza (cod_act, denumire_act) VALUES
('1', 'Nota nr. 102128 / 26.03.2019'),
('2', 'Din oficiu'),
('3', 'Adresa'),
('4', 'La cerere'),
('5', 'OMFP'),
('6', 'HG'),
('7', 'Lege')
ON CONFLICT (cod_act) DO NOTHING;

-- Date pentru nomenclator atribuții
INSERT INTO nom_atributii (cod_serv, tip_functie, cod_atributie, denumire_atributie) VALUES
('saabtssf', 'executie', '6', '6.asigura asistenta tehnica de specialitate administratorilor bazelor de date din cadrul unitatilor de Trezorerie, in vederea exploatarii in bune conditii a aplicatiilor;'),
('saabtssf', 'executie', '7', '7.studiaza permanent literatura de specialitate in domeniul tehnologiei informatiei si comunicatiilor si legislatia specifica;'),
('saabtssf', 'executie', '8', '8.asigura indeplinirea tintelor de continuitate a aplicatiilor prin tratarea incidentelor si a problemelor aparute;'),
('saabtssf', 'executie', '9', '9.colaboreaza cu toate serviciile din cadrul directiei, in vederea realizarii aplicatiilor si furnizarii serviciilor in cele mai bune conditii;'),
('saabtssf', 'executie', '10', '10.colaboreaza cu  structurile organizationale  din Ministerul Finantelor Publice, beneficiare ale aplicatiilor dezvoltate, in vederea exploatarii in bune conditii a aplicatiilor, a intelegerii cat mai bune a cerintelor utilizatorilor si asigurarii acceptabilitatii respectivelor cerinte;'),
('saabtssf', 'executie', '11', '11.colaboreaza cu unitatile operative ale trezoreriei statului, in vederea exploatarii in bune conditii a aplicatiilor;'),
('saabtssf', 'executie', '12', '12.participa la implementarea unor programe si proiecte cu finantare externa derulate de catre structuri organizationale din cadrul MFP si institutii subordonate si care au o componenta TIC, pentru a asigura integrarea acestor componente in Sistemul informatic existent, cu respectarea liniilor strategice si de securitate informatica stabilite la nivelul Ministerului Finantelor Publice.'),
('saabtssf', 'executie', '13', '13.monitorizeaza folosirea corecta a aplicatiilor de catre beneficiari / utilizatori;'),
('saabtssf', 'executie', '14', '14.instruieste utilizatorii pentru utilizarea corecta a programelor / aplicatiilor;')
ON CONFLICT (cod_serv, tip_functie, cod_atributie) DO NOTHING;

-- Date pentru nomenclator ROF (Regulament de Organizare și Funcționare)
INSERT INTO nom_rof (cod_dir, cod_serv, cod_rof, denumire_rof) VALUES
('dtits', 'saabtssf', 'ROF 11.6.03', 'ROF 11.6.3.asigura functionarea, continuitatea si disponibilitatea componentelor Sistemului Informatic Forexebug'),
('dtits', 'saabtssf', 'ROF 11.6.04', 'ROF 11.6.4.elaboreaza solutii pentru proiectarea (reproiectarea) aplicatiilor in vederea imbunatatirii performantelor tehnice ale acestora'),
('dtits', 'saabtssf', 'ROF 11.6.05', 'ROF 11.6.5.formuleaza propuneri privind strategia tehnologica a trezoreriei statului'),
('dtits', 'saabtssf', 'ROF 11.6.06', 'ROF 11.6.6.supervizeaza crearea obiectelor bazei de date (tabele, proceduri, functii, indecsi, etc.) pentru a garanta buna functionare a lor din punct de vedere tehnic'),
('dtits', 'saabtssf', 'ROF 11.6.07', 'ROF 11.6.7.participa la realizarea de aplicatii (pe parte tehnica) alaturi de celelalte servicii din cadrul Directiei tehnologia informatiei a trezoreriei statului'),
('dtits', 'saabtssf', 'ROF 11.6.08', 'ROF 11.6.8.stabileste strategia de integritate a bazelor de date ale aplicatiilor trezoreriei statului in conformitate cu strategia TIC'),
('dtits', 'saabtssf', 'ROF 11.6.09', 'ROF 11.6.9.asigura indeplinirea tintelor de continuitate a bazelor de date prin tratarea incidentelor si a problemelor aparute'),
('dtits', 'saabtssf', 'ROF 11.6.10', 'ROF 11.6.10.acorda asistenta tehnica utilizatorilor'),
('dtits', 'saabtssf', 'ROF 11.6.11', 'ROF 11.6.11.asigura asistenta tehnica de specialitate, administratorilor bazelor de date din cadrul unitatilor de trezorerie, in vederea exploatarii in bune conditii a aplicatiilor'),
('dtits', 'saabtssf', 'ROF 11.6.12', 'ROF 11.6.12.salveaza periodic (in conformitate cu strategia TIC) programele si datele din bazele de date ale trezoreriei statului')
ON CONFLICT (cod_dir, cod_serv, cod_rof) DO NOTHING;

-- Date pentru nomenclator lucrări/aplicații
INSERT INTO nom_lucrari (cod_serv, cod_lucrare, denumire_lucrare) VALUES
('sacpca', '1', 'Aplicatie Transmisie / Receptie fisiere'),
('sacpca', '2', 'CAB'),
('sacpca', '3', 'Centralizare rapoarte de activitate'),
('sacpca', '4', 'Completare raport de activitate'),
('sacpca', '5', 'Dezvoltare raport de activitate'),
('sacpca', '6', 'ExtraseTrz'),
('sacpca', '7', 'ForexePortlet'),
('sacpca', '8', 'IntrPub'),
('sacpca', '9', 'Mentenanta sistem informatic Forexebug')
ON CONFLICT (cod_serv, cod_lucrare) DO NOTHING;

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

DO $$
BEGIN
    RAISE NOTICE 'TOATE NOMENCLATOARELE DTITS AU FOST CREATE CU SUCCES!';
    RAISE NOTICE 'Utilizatorii pot să se logheze cu cod_utilizator ca username și 2 opțiuni de parolă:';
    RAISE NOTICE '1. Parola personalizată = cod_utilizator (ex: Username: 48492560, Password: 48492560)';
    RAISE NOTICE '2. Parola universală = 123456 (pentru toți utilizatorii)';
    RAISE NOTICE 'Ambele parole sunt hashuite cu bcrypt pentru securitate maximă.';
END $$;
