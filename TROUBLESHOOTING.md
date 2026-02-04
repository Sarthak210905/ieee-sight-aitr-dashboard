# Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Build Errors

#### Error: "Cannot find module..."
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Error: "Type error in TypeScript"
**Solution**:
```bash
# Check the file mentioned in error
# Run type check
npx tsc --noEmit
```

---

### 🔴 Database Connection Issues

#### Error: "MongoServerError: Authentication failed"
**Causes**:
- Wrong credentials
- IP not whitelisted

**Solution**:
1. Check MONGODB_URI in environment variables
2. In MongoDB Atlas:
   - Network Access → Add your IP (or 0.0.0.0/0 for all)
   - Database Access → Verify user credentials

#### Error: "Connection timeout"
**Solution**:
- Check network connectivity
- Verify MongoDB cluster is running
- Update connection string to use `+srv` format

---

### 🔴 Google Drive Upload Fails

#### Error: "Invalid credentials"
**Solution**:
1. Regenerate refresh token
2. Verify all Google API credentials
3. Check folder permissions

#### Error: "Insufficient permissions"
**Solution**:
1. Ensure folder ID is correct
2. Share folder with service account email
3. Enable Drive API in Google Cloud Console

---

### 🔴 Environment Variables Not Working

#### In Vercel:
1. Go to Project Settings → Environment Variables
2. Add variables for all environments (Production, Preview, Development)
3. Redeploy after adding

#### In Netlify:
1. Site Settings → Environment Variables
2. Add all required variables
3. Trigger new deployment

#### Locally:
```bash
# Ensure .env file exists in root
cp .env.example .env
# Edit with your values
# Restart dev server
npm run dev
```

---

### 🔴 Pages Not Loading

#### Blank Page
**Check**:
- Browser console for errors
- Network tab for failed requests
- Server logs for crashes

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run build
npm start
```

#### 404 Errors
**Solution**:
- Verify file structure matches Next.js conventions
- Check dynamic routes syntax
- Ensure all pages exported correctly

---

### 🔴 Authentication Issues

#### Can't Login as Admin
**Solution**:
```bash
# Run admin setup script
node scripts/setAdmin.ts
```

#### Session Expires Immediately
**Solution**:
1. Check NEXTAUTH_SECRET is set
2. Verify NEXTAUTH_URL matches deployment URL
3. Clear browser cookies and try again

---

### 🔴 Image Upload/Display Issues

#### Images Not Showing
**Solution**:
1. Check next.config.js has correct image domains
2. Verify Google Drive links are public
3. Check CORS settings

#### Upload Fails
**Solution**:
1. Check file size limits
2. Verify accepted file types
3. Ensure Google Drive has space
4. Check API quotas in Google Cloud Console

---

### 🔴 Performance Issues

#### Slow Page Load
**Solutions**:
- Enable caching in next.config.js
- Optimize images
- Check database query performance
- Monitor API response times

#### Memory Leaks
**Solutions**:
- Check for unmounted component subscriptions
- Verify cleanup in useEffect hooks
- Monitor server memory usage

---

### 🔴 CSS/Styling Issues

#### Tailwind Classes Not Working
**Solution**:
```bash
# Rebuild Tailwind
npm run build
```

#### Styles Different in Production
**Solution**:
- Check CSS module imports
- Verify Tailwind purge settings
- Test with production build locally:
  ```bash
  npm run build
  npm start
  ```

---

### 🔴 API Route Errors

#### 500 Internal Server Error
**Check**:
1. Server logs for stack trace
2. Database connection
3. Environment variables

**Debug**:
```javascript
// Add logging in API routes
console.log('Request:', req.body)
console.log('Error:', error)
```

#### CORS Errors
**Solution**:
Add CORS headers in API routes or next.config.js

---

### 🔴 Deployment-Specific Issues

#### Vercel Build Timeout
**Solution**:
- Optimize build time
- Remove unnecessary dependencies
- Check for infinite loops in build scripts

#### Netlify Deploy Fails
**Solution**:
1. Check build command in netlify.toml or settings
2. Verify Node version compatibility
3. Review build logs for specific errors

---

## 🔍 Debugging Steps

### General Approach:
1. **Reproduce Locally**
   ```bash
   npm run build
   npm start
   ```

2. **Check Logs**
   - Deployment platform logs
   - Browser console
   - Network tab

3. **Verify Environment**
   - All environment variables set
   - Correct Node version
   - Dependencies installed

4. **Test Individual Components**
   - API routes with Postman/curl
   - Database queries separately
   - Frontend components in isolation

---

## 📞 Still Stuck?

### Gather This Information:
- Error message (full stack trace)
- Environment (local/production)
- Steps to reproduce
- Browser/Node version
- Recent changes made

### Next Steps:
1. Search error message in GitHub issues
2. Check Next.js documentation
3. Review MongoDB/Google Drive docs
4. Test with minimal reproduction

---

## 🛠️ Useful Commands

```bash
# Clear all caches
rm -rf .next node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update all packages
npm update

# Run type checking
npx tsc --noEmit

# Build for production
npm run build

# Test production build locally
npm run build && npm start

# Check bundle size
npx @next/bundle-analyzer
```

---

## ✅ Prevention

### Best Practices:
- Always test locally before deploying
- Keep dependencies updated
- Use TypeScript strict mode
- Implement error boundaries
- Monitor production logs
- Set up automated testing

### Before Each Deployment:
```bash
npm run lint
npm run build
# Test locally
npm start
# If all good, deploy
```

---

**Last Updated**: February 4, 2026  
**Status**: Comprehensive troubleshooting guide ready
