# IEEE SIGHT AITR Dashboard

A comprehensive dashboard for IEEE SIGHT AITR to manage documents, track progress, view student achievements, and maintain a leaderboard with monthly winners.

## 🌟 Features

### 📊 Dashboard
- **Document Management** with Google Drive integration
- Upload, view, and delete documents
- Category-based filtering (Reports, Documents, Data)
- **Year-wise data access** for historical records
- Search functionality
- Statistics overview

### 📈 Progress Tracking
- Monthly progress visualization
- Event tracking with targets
- Member growth analytics
- Year-wise filtering
- Detailed statistics with bar charts
- Target completion rates

### 👥 Student Members
- Comprehensive member profiles
- Achievement tracking system
- Individual contribution metrics
- Detailed achievement categories (Event, Contribution, Leadership, Excellence)
- Interactive member cards with quick stats
- Filter members by join year

### 🏆 Leaderboard
- Current rankings with live standings
- Monthly winner showcase
- Historical winner data with year filters
- Trend indicators (up/down/same)
- Top 3 podium display
- Month-wise winner selection

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: MongoDB Atlas
- **File Storage**: Google Drive API
- **ORM**: Mongoose

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud account with Drive API enabled
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project:**
```bash
cd "c:\Users\Sarthak\Desktop\IEEE"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**

Copy `.env.example` to `.env.local`:
```bash
copy .env.example .env.local
```

Edit `.env.local` and fill in your credentials:
- MongoDB Atlas connection string
- Google Drive API credentials
- NextAuth secret

📖 **For detailed setup instructions**, see [SETUP.md](SETUP.md)

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
IEEE/
├── app/
│   ├── api/                  # API routes
│   │   ├── documents/        # Document CRUD operations
│   │   ├── upload/           # File upload to Google Drive
│   │   ├── progress/         # Progress tracking data
│   │   ├── members/          # Member management
│   │   ├── leaderboard/      # Leaderboard data
│   │   ├── winners/          # Monthly winners
│   │   └── years/            # Available years
│   ├── page.tsx              # Main dashboard
│   ├── progress/
│   │   └── page.tsx          # Progress tracking
│   ├── members/
│   │   └── page.tsx          # Student members
│   ├── leaderboard/
│   │   └── page.tsx          # Leaderboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── Sidebar.tsx           # Navigation sidebar
├── lib/
│   ├── mongodb.ts            # MongoDB connection
│   └── googleDrive.ts        # Google Drive service
├── models/
│   ├── Document.ts           # Document schema
│   ├── Progress.ts           # Progress schema
│   ├── Member.ts             # Member schema
│   └── MonthlyWinner.ts      # Winner schema
├── public/                   # Static assets
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── SETUP.md                 # Detailed setup guide
└── README.md
```

## 🔧 Configuration

### Environment Variables

Required environment variables in `.env.local`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Google Drive API
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

See [SETUP.md](SETUP.md) for step-by-step configuration.

## 📊 Database Schema

### Documents
- Name, type, category
- Upload date, size
- Year (for filtering)
- Google Drive file ID and link

### Progress
- Month, year
- Events, members, documents count
- Target values

### Members
- Personal information
- Events attended, contributions
- Points, rank
- Achievements array
- Join year

### Monthly Winners
- Month, year
- Winner details
- Top three rankings

## 🎯 Key Features in Detail

### Year-wise Data Access
- Filter documents by year
- View progress for specific years
- Historical leaderboard data
- Member records by join year

### Google Drive Integration
- Automatic file upload to Google Drive
- Secure file storage
- Direct download links
- Automatic file deletion

### MongoDB Atlas
- Cloud database storage
- Scalable and reliable
- Automatic backups
- Global distribution

## 📱 API Endpoints

- `GET /api/documents?year=2026&category=report` - Get documents
- `POST /api/upload` - Upload file to Google Drive
- `DELETE /api/documents/[id]` - Delete document
- `GET /api/progress?year=2026` - Get progress data
- `GET /api/members?year=2024` - Get members
- `GET /api/leaderboard` - Get current leaderboard
- `GET /api/winners?year=2026` - Get monthly winners
- `GET /api/years` - Get available years

## 🔐 Security Notes

⚠️ **Important**: Before deploying to production:

1. Add authentication and authorization
2. Implement rate limiting
3. Validate all user inputs
4. Use HTTPS
5. Restrict database network access
6. Rotate API keys regularly
7. Enable CORS appropriately

## 🚀 Future Enhancements

- [ ] User authentication (OAuth, JWT)
- [ ] Role-based access control
- [ ] Real-time notifications
- [ ] Export reports to PDF
- [ ] Email notifications for achievements
- [ ] Advanced analytics and charts
- [ ] Mobile app
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Activity logs and audit trail

## 📖 Documentation

- [Setup Guide](SETUP.md) - Complete setup instructions
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

For contributions or issues, please contact IEEE SIGHT AITR.

## 📄 License

This project is maintained by IEEE SIGHT AITR.

---

**Need help?** Check [SETUP.md](SETUP.md) for detailed configuration instructions.
