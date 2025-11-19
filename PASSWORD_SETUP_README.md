# Adăugare Coloane Password Hash în nom_utilizatori

## Prezentare Generală

Acest set de scripturi adaugă coloanele necesare pentru autentificare în tabela `nom_utilizatori` și setează hash-uri bcrypt pentru toți utilizatorii.

## Coloane Adăugate

1. **email** - varchar(255) - Email-ul utilizatorului
2. **password_hash** - varchar(255) - Hash bcrypt pentru parola personalizată
3. **default_password_hash** - varchar(255) - Hash bcrypt pentru parola implicită
4. **status** - varchar(20) - Statusul utilizatorului (default: 'active')
5. **background_color** - varchar(7) - Culoarea de fundal UI (default: '#f9fafb')
6. **created_at** - timestamptz - Data creării
7. **updated_at** - timestamptz - Data ultimei modificări

## Metoda 1: Script SQL Direct (Recomandat)

### Pasul 1: Rulează scriptul SQL în Supabase

```bash
# Deschide Supabase SQL Editor și rulează:
cat add-password-columns.sql
```

Sau copiază conținutul fișierului `add-password-columns.sql` în Supabase SQL Editor și execută.

### Ce face scriptul:

- ✅ Verifică și adaugă coloanele lipsă
- ✅ Setează hash-ul parolei "123456" pentru toți utilizatorii
- ✅ Generează email-uri automate: `cod_utilizator@dtits.ro`
- ✅ Setează status "active" pentru toți
- ✅ Afișează statistici și verificări

## Metoda 2: Script Node.js (Alternativă)

### Pasul 1: Asigură-te că ai variabilele de mediu

```bash
# Verifică că ai în .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Pasul 2: Rulează scriptul

```bash
node set-all-passwords.mjs
```

### Ce face scriptul:

- ✅ Citește toți utilizatorii din `nom_utilizatori`
- ✅ Generează hash bcrypt pentru parola "123456"
- ✅ Actualizează `password_hash` și `default_password_hash`
- ✅ Afișează progres și rezumat

## Informații de Autentificare

După rularea scripturilor, **TOȚI utilizatorii** pot accesa aplicația cu:

```
Username: cod_utilizator (număr din baza de date)
Password: 123456
```

### Exemple:

| Username | Password | Nume Utilizator |
| -------- | -------- | --------------- |
| 18123781 | 123456   | Iuliana Popescu |
| 12345    | 123456   | Ion Ionescu     |
| 67890    | 123456   | Maria Georgescu |

## Verificare

### SQL Query pentru verificare:

```sql
SELECT
    cod_utilizator,
    denumire_utilizator,
    email,
    CASE
        WHEN password_hash IS NOT NULL THEN '✓ Setat'
        ELSE '✗ Lipsă'
    END as password_hash_status,
    CASE
        WHEN default_password_hash IS NOT NULL THEN '✓ Setat'
        ELSE '✗ Lipsă'
    END as default_hash_status,
    status
FROM public.nom_utilizatori
ORDER BY cod_utilizator
LIMIT 10;
```

### Output așteptat:

```
cod_utilizator | denumire_utilizator  | email              | password_hash_status | default_hash_status | status
---------------|---------------------|--------------------|--------------------|--------------------|---------
18123781       | Iuliana Popescu     | 18123781@dtits.ro  | ✓ Setat            | ✓ Setat            | active
12345          | Ion Ionescu         | 12345@dtits.ro     | ✓ Setat            | ✓ Setat            | active
```

## Structura Tabelei Actualizată

```sql
create table public.nom_utilizatori (
  cod_utilizator bigint primary key,
  denumire_utilizator varchar(200) not null,
  cod_functie varchar(10) not null references public.nom_functii(cod_functie),
  numar_matricol integer,
  cod_serv varchar(10) not null references public.nom_servicii(cod_serv),
  email varchar(255),
  password_hash varchar(255),
  default_password_hash varchar(255),
  status varchar(20) default 'active',
  background_color varchar(7) default '#f9fafb',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Hash Bcrypt Folosit

Parola: **123456**  
Hash: `$2a$10$N9qo8uLOickgx2ZMRZoMye8iJHpR6HRUQlO/fv8IQJpgNZR4.WOO6`  
Rounds: **10**

## Securitate

⚠️ **IMPORTANT**:

- Parola "123456" este doar pentru **setup inițial**
- Utilizatorii ar trebui să își schimbe parola la prima autentificare
- Implementează un mecanism de "reset password" în producție
- Consideră adăugarea unei coloane `must_change_password` pentru forțarea schimbării parolei

## Troubleshooting

### Problemă: "Column already exists"

```
✓ Normal - Scriptul verifică automat și nu adaugă coloane duplicate
```

### Problemă: "Permission denied"

```
✗ Verifică că ai drepturi de ALTER TABLE în Supabase
✗ Asigură-te că RLS permite UPDATE pe nom_utilizatori
```

### Problemă: Node script nu găsește utilizatori

```
✗ Verifică variabilele de mediu SUPABASE_URL și SUPABASE_ANON_KEY
✗ Verifică politicile RLS - permite SELECT pe nom_utilizatori
```

## Fișiere Implicate

- `add-password-columns.sql` - Script SQL pentru adăugare coloane și hash-uri
- `set-all-passwords.mjs` - Script Node.js pentru setare hash-uri
- `src/app/support/create table public.sql` - Schema completă actualizată
- `PASSWORD_SETUP_README.md` - Acest fișier

## Next Steps

După rularea scripturilor:

1. ✅ Testează autentificarea cu un utilizator
2. ✅ Verifică că toate hash-urile sunt setate
3. ✅ Implementează funcționalitate "Schimbă parola"
4. ✅ Adaugă validare email dacă este necesar
5. ✅ Configurează notificări pentru reset parola

## Suport

Pentru probleme sau întrebări, verifică:

- Logs în Supabase SQL Editor
- Console output din script Node.js
- Network tab în browser pentru erori API
