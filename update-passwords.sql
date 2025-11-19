-- UPDATE rapid pentru parolele utilizatorilor existenți
-- Rulează acest script în Supabase SQL Editor dacă utilizatorii există deja

-- Hash pentru parola "123456": $2b$10$TZZ6S9DqsS8IvY0hKWfFEOKdIpJPqrhZQqV3hLRUoVudzRscU2Nv2

UPDATE public.nom_utilizatori
SET 
  password_hash = '$2b$10$TZZ6S9DqsS8IvY0hKWfFEOKdIpJPqrhZQqV3hLRUoVudzRscU2Nv2',
  default_password_hash = '$2b$10$TZZ6S9DqsS8IvY0hKWfFEOKdIpJPqrhZQqV3hLRUoVudzRscU2Nv2'
WHERE cod_utilizator IN (18123781, 12345, 67890);

-- Verifică actualizarea
SELECT 
  cod_utilizator,
  denumire_utilizator,
  cod_functie,
  email,
  CASE 
    WHEN password_hash = '$2b$10$TZZ6S9DqsS8IvY0hKWfFEOKdIpJPqrhZQqV3hLRUoVudzRscU2Nv2' 
    THEN '✅ Actualizat'
    ELSE '❌ Vechi'
  END as status_parola
FROM public.nom_utilizatori
WHERE cod_utilizator IN (18123781, 12345, 67890)
ORDER BY cod_utilizator;
