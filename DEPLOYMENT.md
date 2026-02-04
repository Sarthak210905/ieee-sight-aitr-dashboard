# Deployment Guide - IEEE SIGHT AITR Dashboard

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [x] All pages have error handling
- [x] All pages have loading states
- [x] All components have accessibility features (ARIA labels, keyboard navigation)
- [x] TypeScript errors resolved
- [x] No console errors in production build
- [x] Responsive design verified on all screen sizes

### ✅ Security
- [x] Environment variables properly configured
- [x] Security headers added in next.config.js
- [x] API routes have authentication checks
- [x] Input validation on all forms
- [x] XSS protection enabled
- [x] CSRF protection implemented

### ✅ Performance
- [x] Image optimization configured
- [x] Compression enabled
- [x] React Strict Mode enabled
- [x] Code splitting implemented (via Next.js)
- [x] Efficient data fetching with useCallback

### ✅ Configuration Files
- [x] next.config.js - Production optimized
- [x] tailwind.config.ts - Properly configured
- [x] tsconfig.json - Strict mode enabled
- [x] package.json - All dependencies up to date

---

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From project root
vercel --prod
```

#### Step 4: Set Environment Variables in Vercel Dashboard
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add all variables from .env.example:
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (update with your production URL)
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `NEXTAUTH_SECRET` (generate a new one for production)
   - `NEXTAUTH_URL` (your production URL)

#### Step 5: Redeploy
```bash
vercel --prod
```

---

### Option 2: Deploy to Netlify

#### Step 1: Install Netlify CLI
```bash
npm i -g netlify-cli
```

#### Step 2: Build the project
```bash
npm run build
```

#### Step 3: Deploy
```bash
netlify deploy --prod
```

#### Step 4: Configure Environment Variables
- Go to Netlify Dashboard > Site Settings > Environment Variables
- Add all required environment variables

---

### Option 3: Self-Hosted (VPS/Cloud)

#### Requirements:
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx (recommended for reverse proxy)

#### Step 1: Clone and Install
```bash
git clone <your-repo>
cd IEEE
npm install
```

#### Step 2: Set Environment Variables
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

#### Step 3: Build
```bash
npm run build
```

#### Step 4: Start with PM2
```bash
npm install -g pm2
pm2 start npm --name "ieee-dashboard" -- start
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx (optional but recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Environment Variables Setup

### MongoDB Setup:
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Replace in MONGODB_URI

### Google Drive API Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Get client ID, secret, and refresh token
6. Create a folder in Google Drive for uploads
7. Get folder ID from URL

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 📊 Post-Deployment Verification

### Test These Features:
- [ ] Login functionality (member and admin)
- [ ] Document upload/download
- [ ] Member management (add, update, delete)
- [ ] Achievement submissions
- [ ] Event calendar
- [ ] Leaderboard display
- [ ] Progress tracking
- [ ] Certificate generation
- [ ] Reports system

### Performance Checks:
- [ ] Page load times < 3 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile responsiveness
- [ ] All links work correctly

### Security Checks:
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] Admin routes protected
- [ ] File uploads validated
- [ ] SQL injection protection (via Mongoose)

---

## 🔍 Monitoring & Maintenance

### Recommended Tools:
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Lighthouse, WebPageTest

### Regular Maintenance:
1. **Weekly**: Check error logs
2. **Monthly**: Update dependencies
3. **Quarterly**: Security audit
4. **As needed**: Database backups

---

## 🆘 Troubleshooting

### Common Issues:

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Database Connection Issues
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

#### Google Drive Upload Fails
- Verify API credentials
- Check folder permissions
- Regenerate refresh token if needed

#### Environment Variables Not Working
- Restart the application after changes
- Verify spelling and formatting
- Check that variables are set in deployment platform

---

## 📞 Support

For issues:
1. Check deployment logs
2. Review error messages
3. Verify all environment variables
4. Test locally first with production build:
   ```bash
   npm run build
   npm start
   ```

---

## 🎉 Success!

Your IEEE SIGHT AITR Dashboard is now deployed and ready for production use!

**Next Steps:**
1. Share the URL with your team
2. Set up the first admin user
3. Import initial data
4. Train users on the system
5. Monitor performance and errors

---

**Deployed on**: ${new Date().toLocaleDateString()}
**Version**: 1.0.0
**Status**: ✅ PRODUCTION READY
