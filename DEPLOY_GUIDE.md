# 🎮 SNIPER DUEL - GUIDA COMPLETA SETUP E DEPLOY

## 📥 STEP 1: SETUP LOCALE (Testare prima del deploy)

### 1.1 Scarica e decomprimi
```bash
# Scarica sniper-duel-fixed.tar.gz
# Decomprimilo in una cartella
tar -xzf sniper-duel-fixed.tar.gz
cd sniper-duel-fixed
```

### 1.2 Installa dipendenze
```bash
npm install
```

### 1.3 Testa in locale
```bash
npm run dev
```

Apri http://localhost:3000

**Se vedi schermata blu:**
1. Apri Console (F12)
2. Guarda tab "Console" per errori
3. Controlla che Three.js si carichi (vedi "Network" tab)
4. Prova a disattivare estensioni browser

**Se funziona:**
✅ Puoi già giocare in locale con amici sulla stessa rete!
- Trova il tuo IP locale: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
- Gli amici si connettono a `http://TUO_IP:3000`

---

## 🌐 STEP 2: DEPLOY GRATUITO SU RENDER.COM

### 2.1 Crea account Render
1. Vai su https://render.com
2. Click "Get Started" → Sign up with GitHub
3. ✅ GRATIS - No carta richiesta
4. Autorizza Render ad accedere a GitHub

### 2.2 Crea repository GitHub
```bash
cd sniper-duel-fixed

# Inizializza Git
git init
git add .
git commit -m "Initial commit - Sniper Duel"

# Crea repo su GitHub
# Vai su https://github.com/new
# Nome: sniper-duel
# Visibility: Public (o Private)
# NO README, NO .gitignore (li hai già)

# Collega e pusha
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/sniper-duel.git
git push -u origin main
```

### 2.3 Deploy su Render

1. **Vai su Render Dashboard**
   https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Connetti repository GitHub**
   - Click "Connect" accanto a "sniper-duel"
   - Se non vedi il repo, click "Configure GitHub App" e dai permessi

4. **Configura il servizio:**

   ```
   Name: sniper-duel
   Region: Frankfurt (o più vicino a te)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

5. **Variabili ambiente (opzionale):**
   - Click "Advanced"
   - Add Environment Variable:
     - Key: `NODE_ENV`
     - Value: `production`

6. **Click "Create Web Service"**

### 2.4 Aspetta il deploy (2-5 minuti)

Render farà:
1. ⏳ Clone del repo
2. ⏳ npm install
3. ⏳ npm run build (compila Three.js)
4. ⏳ npm start (avvia server)
5. ✅ LIVE!

Vedi i log in tempo reale nella dashboard.

### 2.5 Ottieni l'URL

Render ti darà un URL tipo:
```
https://sniper-duel-xxxx.onrender.com
```

🎮 **CONDIVIDI QUESTO URL CON I TUOI AMICI!**

---

## 🎯 COME GIOCARE

### Host (Tu):
1. Vai su `https://sniper-duel-xxxx.onrender.com`
2. Click "Create Match"
3. Copia il codice a 6 cifre (es: "A3X9K2")
4. Manda su WhatsApp/Discord agli amici

### Guest (Amico):
1. Va allo stesso URL
2. Click "Join Match"
3. Inserisce il codice
4. 💥 PARTITA INIZIA!

---

## 🐛 TROUBLESHOOTING

### Problema: "Schermata blu" in locale

**Causa:** Three.js non si carica o errore JavaScript

**Fix:**
```bash
# 1. Controlla console browser (F12)
# 2. Verifica che Vite sia in ascolto su porta 3000
# 3. Riavvia tutto:

# Chiudi tutto
# Poi:
npm run dev
```

**Se ancora blu:**
- Apri `http://localhost:3000` in tab Incognito
- Controlla errori in Console
- Verifica che `/js/main.js` si carichi (tab Network)

### Problema: "Cannot find module Three"

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problema: Server non si connette (localhost)

**Fix:**
1. Controlla porta 3001 non sia occupata:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Mac/Linux
   lsof -i :3001
   ```

2. Uccidi processo se necessario:
   ```bash
   # Trova PID dal comando sopra, poi:
   kill -9 PID
   ```

3. Riavvia:
   ```bash
   npm run dev
   ```

### Problema: Deploy fallisce su Render

**Build failed:**
- Controlla Build Logs su Render dashboard
- Verifica che `package.json` sia presente nel root
- Assicurati Build Command sia: `npm install && npm run build`

**Deploy succeeded ma sito non funziona:**
- Controlla Logs su Render
- Verifica Start Command sia: `npm start`
- Aspetta 30 secondi dopo "Live" (first boot lento)

**"Application failed to respond":**
- Il server free Render si spegne dopo 15 min inattività
- Primo caricamento dopo inattività = 30-60 secondi
- Questo è normale! Aspetta e ricarica

---

## 🔧 LIMITI FREE TIER RENDER

✅ **Cosa funziona:**
- Deploy illimitati
- 750 ore/mese (sufficiente per gioco sempre online)
- Bandwidth illimitato per traffico ragionevole

⚠️ **Limiti:**
- Server si spegne dopo 15 min senza connessioni
- Primo caricamento lento (30s) dopo sleep
- 512 MB RAM (ok per 1v1, massimo 2-3 partite simultanee)

💡 **Workaround sleep:**
Usa servizio di ping gratuito come UptimeRobot:
- https://uptimerobot.com (free)
- Pinga il tuo URL ogni 5 minuti
- Mantiene server sempre sveglio

---

## 🎮 FEATURES DEL GIOCO

✅ **Implementate:**
- Movement WASD + mouse look
- Sniper rifle con scope
- Hit detection server-side
- Lag compensation
- Invite code system
- Best of 5 rounds
- Health/ammo system
- Kill feed
- Round/match end screens

---

## 📞 SUPPORT

**Errori comuni:**

1. **"Failed to create match"**
   - Reload pagina
   - Controlla status server: `/status`

2. **"Match not found"**
   - Codice sbagliato
   - Match scaduto (timeout 10 min)

3. **Lag/Stuttering:**
   - Normale con Free Render se server lontano
   - Migliora upgradando a piano paid ($7/mese)

4. **Opponent disconnesso:**
   - Partita termina automaticamente
   - Torna al menu

---

## 🚀 UPGRADE OPZIONALE (Migliori performance)

Se vuoi prestazioni migliori:

**Railway.app** ($5/mese):
- No sleep
- Più RAM (1GB)
- Più vicino all'Europa

**Setup Railway:**
```bash
npm install -g railway
railway login
railway init
railway up
```

Ma Render FREE è sufficiente per giocare con amici! 🎯

---

## ✅ CHECKLIST FINALE

Prima di giocare:

- [ ] Hai testato in locale con `npm run dev`
- [ ] Il gioco funziona su localhost:3000
- [ ] Hai pushato su GitHub
- [ ] Deploy Render completato
- [ ] URL render funziona
- [ ] Hai testato create match + join match
- [ ] Hai condiviso URL con amici

ENJOY! 🎮🔫
