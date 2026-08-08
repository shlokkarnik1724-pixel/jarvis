# Open the running demo (fastest)

From the **jarvis** project folder (not your user home folder):

```bash
cd jarvis
git checkout cursor/tactix-ai-mvp-fcc1
git pull origin cursor/tactix-ai-mvp-fcc1
npm install
npm run dev
```

Wait until the terminal shows:

```
✓ Ready
Local: http://localhost:3000
```

Then open **exactly one** of these in Chrome/Edge:

1. **http://localhost:3000/demo** ← one-click running demo (recommended)
2. http://localhost:3000
3. http://127.0.0.1:3000/demo

## If localhost:3000 does not open

### 1) Wrong folder (most common on Windows)
You must run commands inside `jarvis`, not `C:\Users\<you>`.

```bash
cd path\to\jarvis
npm run dev
```

### 2) Port already in use
Close other terminals running Next, then:

**Windows PowerShell**
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
npm run dev
```

**Mac/Linux**
```bash
npx kill-port 3000
npm run dev
```

### 3) Still blank / connection refused
```bash
npm run build
npm run start
```
Then open http://127.0.0.1:3000/demo

## Demo credentials (optional login)
- Email: `investor@demo.tactix.ai`
- Password: `demo1234`
