# Drankkassa (app)

Installeerbare web-app van de drankkassa. Werkt na de eerste keer openen volledig zonder internet.

- **Installeren op iPhone:** open het adres in Safari → Delen → *Zet op beginscherm*.
- **Installeren op Android:** open het adres in Chrome → menu ⋮ → *App installeren*.
- Gegevens (knoppen, pincode, dagtotaal) staan per toestel in de app zelf.

## Nieuwe versie publiceren
1. Pas `index.html` aan.
2. Verhoog `CACHE` in `sw.js` (bv. `drankkassa-v2`).
3. Commit en push naar GitHub; GitHub Pages zet het binnen een minuut online.
4. Toestellen krijgen de nieuwe versie de **tweede** keer dat ze de app openen met internet.
