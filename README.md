# 🎮 Sniper Duel - 1v1 FPS Browser Game

Gioco FPS multiplayer 1v1 con Three.js e Socket.io

## 🚀 Quick Start (Locale)

```bash
# 1. Installa dipendenze
npm install

# 2. Avvia server + client
npm run dev
```

Apri http://localhost:3000

## 📦 Deploy GRATUITO su Render.com

### Setup Iniziale (Una volta sola)

1. **Crea account su Render.com**
   - Vai su https://render.com
   - Sign up con GitHub (gratis, no carta)

2. **Crea repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/sniper-duel.git
   git push -u origin main
   ```

3. **Deploy su Render**
   - Vai su Render Dashboard
   - Click "New +" → "Web Service"
   - Connetti GitHub repository
   - Settings:
     - **Name**: sniper-duel
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"

4. **Aspetta 2-3 minuti**
   - Render builderà e deployerà automaticamente
   - Ti darà un URL tipo: `https://sniper-duel-xxxx.onrender.com`

5. **Gioca!**
   - Apri l'URL
   - Condividi con amici
   - Create Match → Copia codice → Condividi

## 🎯 Controls

- **WASD**: Movimento
- **Mouse**: Mira
- **Click Sinistro**: Spara
- **Click Destro**: Scope
- **Space**: Salta
- **C**: Accucciati
- **R**: Ricarica

## ⚙️ Game Rules

- Headshot = 100 danno (kill istantaneo)
- Body shot = 75 danno
- Limb shot = 50 danno
- Best of 5 rounds (primo a 3 vince)
- 3 minuti per round

## 🔧 Troubleshooting

**Schermata blu?**
- Apri console (F12)
- Controlla errori
- Verifica che Three.js sia caricato

**Server non si connette?**
- Controlla che porta 3001 sia libera
- Riavvia: `npm run dev`

**Deploy non funziona?**
- Verifica Build Logs su Render
- Controlla che Start Command sia `npm start`
