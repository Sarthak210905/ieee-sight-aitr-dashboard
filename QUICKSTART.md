# Quick Start Guide

## 🚀 Running the Dashboard

Once you've completed the setup in [SETUP.md](SETUP.md), follow these steps:

### 1. Start the Server

```bash
npm run dev
```

The dashboard will be available at: http://localhost:3000

### 2. First Time Setup Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Environment variables are configured in `.env.local`
- [ ] Google Drive folder is created and folder ID is set
- [ ] All dependencies are installed (`npm install`)

---

## 📖 Using the Dashboard

### Main Dashboard (Home)

**Upload Documents:**
1. Click "Upload Document" button
2. Select a file from your computer
3. File will be uploaded to Google Drive automatically
4. Document metadata saved to MongoDB

**Filter Documents:**
- Use the search box to find specific documents
- Select year from dropdown to view historical documents
- Filter by category: Reports, Documents, or Data

**Download/Delete:**
- Click download icon to open file in Google Drive
- Click trash icon to delete (removes from both Drive and database)

---

### Progress Tracking

**View Monthly Progress:**
- See events conducted, member count, and documents uploaded
- Visual progress bars show target completion
- Select different years to view historical data

**Key Metrics:**
- Current month events
- Total events across all time
- Average target completion percentage
- Active member count

---

### Student Members

**View Members:**
- Browse all registered members
- Top 3 performers highlighted with medals
- Search by name or branch

**Member Details:**
- Click any member card to see full profile
- View all achievements
- See contribution statistics

**Filter Options:**
- Search by name or branch
- View members by join year

---

### Leaderboard

**Current Standings:**
- Live rankings based on points
- Trend indicators (up/down arrows)
- Rank changes from previous period

**Monthly Winners:**
- Select month/year to view past winners
- Top 3 performers for each month
- Winner statistics and achievements

---

## 🔑 Key Features

### Year-wise Data Access

All pages support year filtering:
- **Documents**: Filter by upload year
- **Progress**: View specific year's progress
- **Members**: Filter by join year
- **Leaderboard**: Historical winners by year

### Google Drive Integration

Benefits:
- ✅ Unlimited storage (based on your Google account)
- ✅ Access files from anywhere
- ✅ Share links easily
- ✅ Automatic backups
- ✅ Version history

### MongoDB Database

All data is stored in MongoDB Atlas:
- Members and achievements
- Progress tracking
- Leaderboard history
- Document metadata (files in Drive)

---

## 💡 Tips & Best Practices

### Document Management

1. **Naming Convention**: Use clear names like "Monthly-Report-Jan-2026.pdf"
2. **Categories**: 
   - **Reports**: Monthly/annual reports
   - **Documents**: Meeting minutes, proposals
   - **Data**: Spreadsheets, analytics
3. **Regular Cleanup**: Delete outdated documents to save space

### Adding Members

To add new members, you can:
1. Use MongoDB Compass or Atlas web interface
2. Create an API endpoint (future enhancement)
3. Use the seed script pattern

### Tracking Progress

Update progress monthly:
1. Record events conducted
2. Update member count
3. Document uploads are tracked automatically
4. Set realistic targets

### Leaderboard Updates

Points can be awarded for:
- Event attendance (+10 points each)
- Contributions (+15 points each)
- Leadership roles (+50 points)
- Special achievements (+25 points)

---

## 🛠 Maintenance Tasks

### Weekly
- [ ] Check for new uploads
- [ ] Review member activities

### Monthly
- [ ] Update progress data
- [ ] Record monthly winner
- [ ] Clean up old/duplicate files
- [ ] Backup database (Atlas does this automatically)

### Yearly
- [ ] Archive old year's data
- [ ] Generate annual report
- [ ] Review and update member list
- [ ] Update targets for new year

---

## 🔧 Troubleshooting

### "Cannot fetch documents"
- Check MongoDB connection in `.env.local`
- Verify MongoDB Atlas cluster is running
- Check network access settings in Atlas

### "Upload failed"
- Verify Google Drive credentials
- Check refresh token is valid
- Ensure folder ID is correct
- Check file size (Drive has limits)

### "Page won't load"
- Clear browser cache
- Restart development server
- Check console for errors
- Verify all dependencies installed

### "No data showing"
- Database might be empty - add sample data
- Check API endpoints are working
- Verify environment variables

---

## 📊 Sample Data

To populate with sample data for testing, you can use the MongoDB Compass or create a seed script.

### Adding Sample Members via MongoDB Compass

1. Connect to your MongoDB Atlas cluster
2. Select the `ieee-sight-aitr` database
3. Go to `members` collection
4. Click "Insert Document"
5. Paste this sample:

```json
{
  "name": "Test Student",
  "email": "test@aitr.ac.in",
  "branch": "Computer Science",
  "year": "3rd Year",
  "eventsAttended": 5,
  "contributions": 3,
  "points": 125,
  "rank": 1,
  "joinYear": 2024,
  "achievements": [
    {
      "id": "ach1",
      "title": "First Event",
      "description": "Attended first IEEE event",
      "date": "2024-09-15T00:00:00.000Z",
      "category": "event",
      "icon": "🎉"
    }
  ]
}
```

---

## 🚀 Next Steps

After getting familiar with the dashboard:

1. **Add Authentication**: Implement user login (NextAuth.js recommended)
2. **Add More Features**: Email notifications, PDF exports
3. **Mobile App**: Create React Native or Flutter app
4. **Analytics**: Advanced charts and insights
5. **Automation**: Auto-generate reports, reminder emails

---

## 📞 Support

For questions or issues:
- Check [SETUP.md](SETUP.md) for configuration help
- Review [README.md](README.md) for feature details
- Contact your IEEE SIGHT AITR technical team

---

Happy organizing! 🎉
