# 🚀 Script Complet Supabase Setup

## Ce face acest script?

Acest script SQL creează automat **TOATE** tabelele necesare pentru aplicația ProjectRIZ în Supabase:

### ✅ Tabelele aplicației existente:
- `users` - utilizatori aplicație
- `activities` - activități utilizatori

### ✅ Nomenclatoarele pentru servicii publice:
- `nom_directie` - direcții organizaționale
- `nom_servicii` - servicii din cadrul direcțiilor  
- `nom_functii` - funcții și poziții
- `nom_utilizatori` - angajați din nomenclator
- `nom_atributii` - atribuțiile funcțiilor
- `nom_act_baza` - acte normative și documente
- `nom_buget_timp` - evidența timpului de lucru
- `nom_calendar` - calendar zile lucrătoare/nelucrătoare
- `nom_lucrari` - lucrări și aplicații
- `nom_rof` - regulamente de organizare și funcționare

## 🔧 Cum să folosești script-ul:

1. **Deschide Supabase Dashboard**
   - Logează-te la [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selectează proiectul tău

2. **Mergi la SQL Editor**
   - Click pe "SQL Editor" din meniul lateral

3. **Copiază și execută script-ul**
   - Deschide fișierul `supabase_complete_setup.sql`
   - Selectează tot conținutul (Ctrl+A)
   - Copiază (Ctrl+C)
   - Lipește în SQL Editor (Ctrl+V)
   - Click pe "Run" sau apasă F5

4. **Verifică rezultatul**
   - Mergi la "Table Editor"
   - Verifică că toate tabelele sunt create
   - Datele inițiale sunt automat populate

## ⚡ De ce să folosești acest script?

- **Rapid**: Toate tabelele în 30 de secunde
- **Sigur**: Include toate constraint-urile și relațiile
- **Complet**: Indexuri pentru performanță incluse
- **Cu date**: Exemple de date pentru testare
- **Verificat**: Include verificări automate

## 🛡️ Ce se întâmplă dacă rulezi din nou?

Script-ul folosește `CREATE TABLE IF NOT EXISTS` și `ON CONFLICT DO NOTHING`, deci:
- Nu va șterge date existente
- Nu va duplica tabelele
- Este sigur să rulezi de mai multe ori

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică că ai permisiuni de admin în Supabase
2. Asigură-te că proiectul Supabase este activ
3. Verifică că nu ai limite de storage atinse

---
**Creat pentru ProjectRIZ - Sistem de Management pentru Servicii Publice** 🏛️