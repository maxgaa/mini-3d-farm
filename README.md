# Mini 3D-Farm

Kleines Übungsprojekt: Low-Poly-Farm von schräg oben. Klick pflanzt, die Pflanze wächst in Stufen, Klick erntet.

## Start

```bash
npm install
npm run dev
```

Im Browser öffnen: [http://localhost:5173](http://localhost:5173) (Vite startet den Dev-Server automatisch nicht im Browser).

## Steuern

- Leere Kachel klicken: Saat setzen
- Warten: Saat → Spross → kleine Pflanze → erntereif (je etwa 3,5 Sekunden)
- Erntereife Pflanze klicken: ernten, Zähler +1, Kachel wieder frei
