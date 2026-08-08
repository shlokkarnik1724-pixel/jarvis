# Open Tactix AI on Windows (exact steps)

## Fastest way

1. Open File Explorer
2. Go into your `jarvis` folder  
   Example: `C:\Users\shlok karnik\jarvis`
3. Double-click **`start-demo.bat`**
4. Wait until the black window shows:
   ```
   ✓ Ready
   Local: http://127.0.0.1:3000
   ```
5. Open Chrome and go to:

**http://127.0.0.1:3000/demo**

Keep the black window open. Closing it stops the app.

---

## Manual way (PowerShell)

Open PowerShell and run **one command at a time**:

```powershell
cd "C:\Users\shlok karnik\jarvis"
```

Confirm you are in the right folder:

```powershell
dir package.json
```

You must see `package.json`. If not, you are in the wrong folder.

Then:

```powershell
git checkout cursor/tactix-ai-mvp-fcc1
git pull origin cursor/tactix-ai-mvp-fcc1
npm install
npm run dev
```

When Ready appears, open:

**http://127.0.0.1:3000/demo**

---

## If it still does not open

### A) Browser says “This site can’t be reached”
- The server is not running, or you closed the terminal
- Run `start-demo.bat` again and wait for `Ready`

### B) Port 3000 already in use
In PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
cd "C:\Users\shlok karnik\jarvis"
npm run dev
```

### C) You ran commands from `C:\Users\shlok karnik` (wrong)
That causes the lockfile warning and broken startup.  
Always `cd` into `jarvis` first.

### D) Node is missing
Install Node LTS from https://nodejs.org  
Then reopen PowerShell and retry.

### E) Still stuck — production mode
```powershell
cd "C:\Users\shlok karnik\jarvis"
npm run build
npm run start
```
Then open http://127.0.0.1:3000/demo

---

## Correct demo link

Use this exact URL:

**http://127.0.0.1:3000/demo**

That seeds Acme and opens the **thesis tour** → then use **Operating Map**, approve a skill, and try the **Sandbox**.

Not `https://`, not a random port, not just `localhost` without the server running.
