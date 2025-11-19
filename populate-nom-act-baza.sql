-- Script pentru popularea tabelei nom_act_baza cu acte legislative comune
-- Rulează acest script în Supabase SQL Editor

-- Șterge datele existente (dacă există)
TRUNCATE TABLE public.nom_act_baza CASCADE;

-- Inserează acte de bază comune în România
INSERT INTO public.nom_act_baza (cod_act, denumire_act) VALUES
(1, 'Constituția României'),
(2, 'Legea nr. 500/2002 privind finanțele publice'),
(3, 'Legea nr. 273/2006 privind finanțele publice locale'),
(4, 'Legea nr. 98/2016 privind achizițiile publice'),
(5, 'Legea nr. 99/2016 privind achiziții sectoriale'),
(6, 'Legea nr. 100/2016 privind concesiuni de lucrări și servicii'),
(7, 'OUG nr. 57/2019 privind Codul administrativ'),
(8, 'Legea nr. 188/1999 privind Statutul funcționarilor publici'),
(9, 'Legea nr. 53/2003 - Codul Muncii'),
(10, 'Legea nr. 227/2015 privind Codul fiscal'),
(11, 'Legea nr. 207/2015 privind Codul de procedură fiscală'),
(12, 'Legea nr. 1/2011 a educației naționale'),
(13, 'Legea nr. 95/2006 privind reforma în domeniul sănătății'),
(14, 'Legea nr. 51/1995 republicată - Legea organizării și exercitării profesiei de avocat'),
(15, 'Legea nr. 85/2014 privind procedurile de prevenire a insolvenței'),
(16, 'OUG nr. 195/2002 privind circulația pe drumurile publice'),
(17, 'Legea nr. 10/1995 privind calitatea în construcții'),
(18, 'Legea nr. 50/1991 privind autorizarea construcțiilor'),
(19, 'Legea nr. 350/2001 privind amenajarea teritoriului și urbanismul'),
(20, 'Legea nr. 319/2006 a sănătății și securității în muncă'),
(21, 'Legea nr. 255/2010 privind exproprierea pentru cauză de utilitate publică'),
(22, 'Legea nr. 287/2009 privind Codul civil'),
(23, 'Legea nr. 134/2010 privind Codul de procedură civilă'),
(24, 'Legea nr. 286/2009 privind Codul penal'),
(25, 'Legea nr. 135/2010 privind Codul de procedură penală'),
(26, 'Legea nr. 544/2001 privind liberul acces la informațiile de interes public'),
(27, 'Legea nr. 52/2003 privind transparența decizională în administrația publică'),
(28, 'Legea nr. 554/2004 a contenciosului administrativ'),
(29, 'Legea nr. 24/2000 privind normele de tehnică legislativă'),
(30, 'HG nr. 1/2016 pentru aprobarea Normelor metodologice de aplicare a Legii nr. 98/2016'),
(31, 'HG nr. 395/2016 pentru aprobarea Normelor metodologice de aplicare a Legii nr. 99/2016'),
(32, 'HG nr. 867/2016 pentru aprobarea Normelor metodologice de aplicare a Legii nr. 100/2016'),
(33, 'Alte acte normative'),
(34, 'Regulamente interne'),
(35, 'Proceduri operaționale'),
(36, 'Instrucțiuni de lucru'),
(37, 'Ordine de serviciu'),
(38, 'Note de serviciu'),
(39, 'Decizii administrative'),
(40, 'Hotărâri ale consiliilor locale/județene')
ON CONFLICT (cod_act) 
DO UPDATE SET
  denumire_act = EXCLUDED.denumire_act;

-- Verificare
SELECT COUNT(*) as total_acte FROM public.nom_act_baza;
SELECT * FROM public.nom_act_baza ORDER BY cod_act LIMIT 10;
