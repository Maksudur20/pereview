# Deployment Guide — Perfume Review & Discovery System

## Architecture Overview

```
┌──────────────┐     HTTPS      ┌─────────────────┐     MongoDB Atlas
│   Vercel     │  ──────────►   │   Render         │  ──────────────►  Cloud DB
│  (Frontend)  │   REST API     │  (Backend API)   │
│  React SPA   │  ◄──────────   │  Node/Express    │  ──► Cloudinary
└──────────────┘                └─────────────────┘       (Images)
```

---

## Prerequisites

Before deploying, you need accounts on:
- [GitHub](https://github.com) — to host your code
- [Vercel](https://vercel.com) — frontend hosting (free tier)
- [Render](https://render.com) — backend hosting (free tier)
- [MongoDB Atlas](https://cloud.mongodb.com) — database (free M0 tier)
- [Cloudinary](https://cloudinary.com) — image CDN (free tier)
- [Google Cloud Console](https://console.cloud.google.com) — OAuth credentials

---

## Step 1: Push Code to GitHub

Create **two** GitHub repositories (recommended) or one monorepo:

### Option A: Two Repos (Recommended)
```bash
# Backend repo
cd backend
git init
git add .
git commit -m "Backend: Perfume Review API"
git remote add origin https://github.com/YOUR_USERNAME/pereview-api.git
git push -u origin main

# Frontend repo
cd ../frontend
git init
git add .
git commit -m "Frontend: Perfume Review App"
git remote add origin https://github.com/YOUR_USERNAME/pereview-app.git
git push -u origin main
```

### Option B: Monorepo (Current Structure)
```bash
# From project root (e:\pereview)
git remote add origin https://github.com/YOUR_USERNAME/pereview.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free **M0 cluster**
3. Under **Database Access** → Add a database user with password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — required for Render)
5. Click **Connect** → **Drivers** → Copy the connection string
6. Replace `<password>` with your database user password

Your connection string will look like:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/pereview?retryWrites=true&w=majority
```

---

## Step 3: Set Up Cloudinary

1. Go to [Cloudinary Console](https://console.cloudinary.com)
2. From the **Dashboard**, copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 4: Set Up Google OAuth 2.0

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **OAuth consent screen** → Configure as **External** → Fill basics → Save
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins** — add:
   - `http://localhost:3000` (local dev)
   - `https://your-app-name.vercel.app` (production — update after Vercel deploy)
7. **Authorized redirect URIs** — add:
   - `http://localhost:3000`
   - `https://your-app-name.vercel.app`
8. Copy the **Client ID**

---

## Step 5: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub **backend** repo (or monorepo with root directory set to `backend`)
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `pereview-api` |
| **Region** | Oregon (US West) or closest |
| **Branch** | `main` |
| **Root Directory** | `backend` (if monorepo) or leave blank |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

5. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://...` (from Step 2) |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` |
| `GOOGLE_CLIENT_ID` | (from Step 4) |
| `CLOUDINARY_CLOUD_NAME` | (from Step 3) |
| `CLOUDINARY_API_KEY` | (from Step 3) |
| `CLOUDINARY_API_SECRET` | (from Step 3) |
| `CLIENT_URL` | `https://your-app-name.vercel.app` (update after Step 6) |

6. Click **Create Web Service**
7. Wait for the build to complete (~2-3 min)
8. Note your Render URL: `https://pereview-api.onrender.com`
9. Test it: visit `https://pereview-api.onrender.com/api/health`

> **Note:** On Render's free tier, the service sleeps after 15 min of inactivity. First request after sleep takes ~30s to spin up.

---

## Step 6: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub **frontend** repo (or monorepo)
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Create React App |
| **Root Directory** | `frontend` (if monorepo) or leave blank |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |

5. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://pereview-api.onrender.com/api` (your Render URL from Step 5) |
| `REACT_APP_GOOGLE_CLIENT_ID` | (same Client ID from Step 4) |

6. Click **Deploy**
7. Wait for the build to complete (~1-2 min)
8. Note your Vercel URL: `https://your-app-name.vercel.app`

---

## Step 7: Post-Deploy Configuration

After both services are live, update the cross-references:

### Update Render (Backend)
1. Go to Render Dashboard → `pereview-api` → Environment
2. Set `CLIENT_URL` = `https://your-app-name.vercel.app` (your actual Vercel URL)
3. Render will auto-redeploy

### Update Google OAuth
1. Go to Google Cloud Console → Credentials → Your OAuth Client
2. Add your Vercel URL to:
   - **Authorized JavaScript origins**: `https://your-app-name.vercel.app`
   - **Authorized redirect URIs**: `https://your-app-name.vercel.app`

---

## Step 8: Verify Deployment

Test these in order:

1. **Health Check**: `GET https://pereview-api.onrender.com/api/health`
2. **Frontend loads**: Visit `https://your-app-name.vercel.app`
3. **Registration**: Create a new account
4. **Google Login**: Test OAuth sign-in
5. **Browse perfumes**: Check the perfume listing page
6. **Admin**: Login as admin, add a perfume with image upload

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `pereview.com`)
3. Configure DNS: Add CNAME record pointing to `cname.vercel-dns.com`

### Render (Backend)
1. Render Dashboard → Service → Settings → Custom Domains
2. Add your API domain (e.g., `api.pereview.com`)
3. Configure DNS as instructed by Render

After adding a custom domain, update:
- `CLIENT_URL` on Render → your new frontend domain
- `REACT_APP_API_URL` on Vercel → your new API domain
- Google OAuth authorized origins/redirects

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS errors** | Ensure `CLIENT_URL` on Render exactly matches your Vercel URL (no trailing slash) |
| **502 on Render** | Check Render logs. Usually a missing env variable or DB connection issue |
| **Google OAuth fails** | Verify the Client ID matches on both frontend and backend, and origins are whitelisted |
| **Images not uploading** | Verify Cloudinary credentials are correct in Render env vars |
| **Blank page on Vercel** | Check that `REACT_APP_API_URL` is set (env vars starting with `REACT_APP_` are baked at build time — redeploy after changing) |
| **API returns 401** | Token may be invalid. Clear localStorage and re-login |
| **Render service sleeps** | Free tier limitation. Consider upgrading to Starter ($7/mo) for always-on |
| **Build fails on Vercel** | Check `CI=false` environment variable — Vercel treats warnings as errors by default. Add `CI=false` to env vars |

---

## Cost Summary (Free Tier)

| Service | Plan | Limit |
|---------|------|-------|
| **Vercel** | Hobby (Free) | 100GB bandwidth/mo, serverless |
| **Render** | Free | 750 hrs/mo, sleeps after 15min idle |
| **MongoDB Atlas** | M0 (Free) | 512MB storage, shared cluster |
| **Cloudinary** | Free | 25K transformations/mo, 25GB storage |
| **Google OAuth** | Free | No cost for authentication |

**Total monthly cost: $0**
