# Setup Guide: MongoDB Atlas & Google Drive Integration

This guide will help you set up MongoDB Atlas and Google Drive API for the IEEE SIGHT AITR Dashboard.

## Prerequisites

- Node.js 18+ installed
- A Google account
- MongoDB Atlas account (free tier available)

---

## Part 1: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new organization and project

### Step 2: Create a Cluster

1. Click **"Build a Database"**
2. Choose **"FREE"** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click **"Create Cluster"**

### Step 3: Configure Database Access

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `ieee-admin` (or your choice)
5. Set a strong password and save it
6. Set **"Database User Privileges"** to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production: Add only your server's IP address
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **"Database"** and click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Driver: Node.js"** and **"Version: 5.5 or later"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add database name after `.net/`: `ieee-sight-aitr`
   
   Final format:
   ```
   mongodb+srv://ieee-admin:yourpassword@cluster0.xxxxx.mongodb.net/ieee-sight-aitr?retryWrites=true&w=majority
   ```

---

## Part 2: Google Drive API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `IEEE-SIGHT-AITR-Dashboard`
4. Click **"Create"**

### Step 2: Enable Google Drive API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"** (for testing)
   - Fill in app name: `IEEE SIGHT AITR Dashboard`
   - Add your email as support email
   - Add your email in developer contact
   - Click **"Save and Continue"** through all steps
4. Back to Create OAuth client ID:
   - Application type: **"Web application"**
   - Name: `IEEE Dashboard`
   - **Authorized redirect URIs**: Add `http://localhost:3000/api/auth/google/callback`
   - Click **"Create"**
5. **Save the Client ID and Client Secret** - you'll need these!

### Step 4: Get Refresh Token

You need to generate a refresh token to access Google Drive programmatically.

#### Option A: Using OAuth Playground (Recommended)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the ⚙️ (settings) icon in the top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret**
5. Close settings
6. In **"Step 1 Select & authorize APIs"**:
   - Find **"Drive API v3"**
   - Select `https://www.googleapis.com/auth/drive.file`
   - Click **"Authorize APIs"**
7. Sign in with your Google account
8. In **"Step 2 Exchange authorization code for tokens"**:
   - Click **"Exchange authorization code for tokens"**
9. **Copy the Refresh Token** - save it securely!

#### Option B: Manual Code Approach

Create a temporary file `get-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Your refresh token:', token.refresh_token);
  });
});
```

Run: `node get-token.js`

### Step 5: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder: **"IEEE SIGHT AITR Documents"**
3. Open the folder
4. Copy the **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          This is your Folder ID
   ```

---

## Part 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Fill in all the values you collected:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/ieee-sight-aitr?retryWrites=true&w=majority

# Google Drive API Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Next Auth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Generate NEXTAUTH_SECRET

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

---

## Part 4: Install Dependencies and Run

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

---

## Part 5: Seed Initial Data (Optional)

To populate your database with sample data, you can use the seed script:

Create `scripts/seed.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const { Member } = require('../models/Member');
const { Progress } = require('../models/Progress');
const { MonthlyWinner } = require('../models/MonthlyWinner');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed members
    const members = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@aitr.ac.in',
        branch: 'Computer Science',
        year: '3rd Year',
        eventsAttended: 12,
        contributions: 8,
        points: 450,
        rank: 1,
        joinYear: 2024,
        achievements: []
      },
      // Add more members...
    ];

    await Member.insertMany(members);
    console.log('Members seeded');

    // Seed progress
    const progress = [
      { month: 'January', year: 2026, events: 3, members: 45, documents: 12, target: 5 },
      // Add more progress data...
    ];

    await Progress.insertMany(progress);
    console.log('Progress seeded');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
```

Run: `node scripts/seed.js`

---

## Troubleshooting

### MongoDB Connection Issues

- **Error: "IP not whitelisted"**
  → Add your IP in Network Access settings

- **Error: "Authentication failed"**
  → Check username and password in connection string

### Google Drive Issues

- **Error: "Invalid grant"**
  → Refresh token expired, generate a new one

- **Error: "Insufficient permissions"**
  → Make sure you selected the correct scopes when generating the refresh token

### File Upload Issues

- **Files not uploading**
  → Check Google Drive Folder ID is correct
  → Verify refresh token is valid

---

## Production Deployment

### For Production:

1. **MongoDB**: 
   - Use dedicated cluster (not free tier)
   - Restrict network access to your server IP only
   - Enable authentication

2. **Google Drive**:
   - Complete OAuth consent screen verification
   - Use a service account instead of OAuth for better security
   - Set up proper folder permissions

3. **Environment Variables**:
   - Never commit `.env.local` to version control
   - Use your hosting platform's environment variable settings
   - Generate new secure secrets for production

4. **Update URLs**:
   - Change `NEXTAUTH_URL` to your production domain
   - Update `GOOGLE_REDIRECT_URI` to production callback URL
   - Add production domain to Google Cloud Console authorized URIs

---

## Security Best Practices

1. ✅ Never share your `.env.local` file
2. ✅ Use different credentials for development and production
3. ✅ Rotate secrets regularly
4. ✅ Enable MongoDB Atlas encryption at rest
5. ✅ Use HTTPS in production
6. ✅ Implement rate limiting for API routes
7. ✅ Add authentication before deploying to production

---

## Support

For issues or questions:
- Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
- Google Drive API documentation: https://developers.google.com/drive/api/guides/about-sdk
- Next.js documentation: https://nextjs.org/docs

---

## Next Steps

Once setup is complete:

1. ✅ Test document upload functionality
2. ✅ Add sample members and progress data
3. ✅ Test year-wise filtering
4. ✅ Add authentication (recommended)
5. ✅ Deploy to production

Good luck with your IEEE SIGHT AITR Dashboard! 🚀
