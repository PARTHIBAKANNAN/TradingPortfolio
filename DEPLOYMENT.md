# Cloudflare Pages Deployment Guide

## ✅ Code Status
- Repository: https://github.com/PARTHIBAKANNAN/TradingPortfolio
- Branch: `master`
- Latest commit: "Add Supabase authentication with new project - login working"

## Step 1: Connect GitHub to Cloudflare Pages

1. Go to **Cloudflare Dashboard**
2. Click **Pages** in the left sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize GitHub and select repository: **PARTHIBAKANNAN/TradingPortfolio**
6. Click **Install & Authorize**

## Step 2: Configure Build Settings

When prompted, enter:

| Setting | Value |
|---------|-------|
| **Production branch** | `master` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (or leave empty) |

## Step 3: Set Environment Variables

1. After creating project, go to **Settings** → **Environment variables**
2. Add these variables for PRODUCTION:
   ```
   VITE_SUPABASE_URL=https://uuuqfihtquirgjhynoem.supabase.co
   VITE_SUPABASE_KEY=sb_publishable_IiuxYcQ8XH3FAxUOZy9F5A_Ydq4QC24
   ```

3. Also add for D1 Database (if using):
   ```
   DATABASE_URL=your_d1_database_url
   ```

## Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Clone the repository
   - Run `npm run build`
   - Deploy the `dist` folder
   - Provide a production URL

## Step 5: Verify Deployment

1. Wait for build to complete
2. You'll get a URL like: `https://trade-portfolio.pages.dev`
3. Test login with:
   - Email: `parthisivaaram45@gmail.com`
   - Password: (your Supabase password)

## Build Configuration

```toml
# wrangler.toml
name = "trade-portfolio"
compatibility_date = "2026-07-15"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "trade_portfolio_db"
database_id = "your_database_id"
migrations_dir = "migrations"
```

## Expected Output

After deployment, you should have:
- ✅ Frontend deployed to Cloudflare Pages
- ✅ API endpoints available at `/api/*`
- ✅ Supabase authentication working
- ✅ Database connected via D1

## Troubleshooting

### Build fails with "Cannot find module"
- Ensure all dependencies are in `package.json`
- Run `npm install` locally first

### Authentication not working
- Verify environment variables are set in Cloudflare
- Check browser console for CORS issues
- Ensure Supabase project is active

### Database not connected
- Update `database_id` in `wrangler.toml`
- Run migrations: `npm run migrate`

---

**Status**: Ready for deployment! 🚀
