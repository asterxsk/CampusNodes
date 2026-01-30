# GitHub Pages Deployment Guide

I've already configured your project for deployment!
*   **Router**: Switched to `HashRouter` (works perfectly on GitHub Pages).
*   **Config**: Added `base: './'` to `vite.config.js`.
*   **Scripts**: Added `npm run deploy`.

## 1. Create Repository
1.  Go to [GitHub.com/new](https://github.com/new).
2.  Name it (e.g., `foe-app`).
3.  Create Repository.

## 2. Push Code (Run in Terminal)
Run these commands one by one in your terminal:

```powershell
# 1. Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# 2. Add Remote (Replace URL with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/foe-app.git

# 3. Rename branch to main
git branch -M main

# 4. Push code
git push -u origin main
```

## 3. Deploy
Once the code is on GitHub, run this magic command:

```powershell
npm run deploy
```

## 4. Supabase Setting
Since your domain will change (e.g., `https://prithish.github.io/foe-app`), go to Supabase:
1.  **Authentication** -> **URL Configuration**
2.  Add your new GitHub URL to "Site URL" and "Redirect URLs".

Done! 🚀
