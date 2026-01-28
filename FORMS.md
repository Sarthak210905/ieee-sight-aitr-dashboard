# Forms Documentation

This document describes all the forms available in the IEEE SIGHT AITR Dashboard and how to use them.

## Overview

The dashboard includes several forms for managing data:

1. **Add Member Form** - Add new student members
2. **Update Member Form** - Update member stats and add achievements
3. **Add Progress Form** - Track monthly progress
4. **Add Winner Form** - Declare monthly winners

---

## 1. Add Member Form

**Location:** Members page  
**Trigger:** Click the "Add Member" button (+ icon) in the top-right corner

### Fields:

- **Full Name*** (required) - Student's full name
- **Email*** (required) - Student's email address (must be valid format)
- **Branch*** (required) - Department/Branch (CSE, ECE, etc.)
- **Year*** (required) - Current year (1st Year, 2nd Year, etc.)
- **Join Year*** (required) - Year when they joined IEEE SIGHT (2020-2025)

### Functionality:

- Validates email format
- Sets initial values: 0 events, 0 contributions, 0 points, empty achievements array
- Auto-calculates rank based on points
- Calls `/api/members` POST endpoint
- Refreshes member list on success

### Usage Example:

```
Name: Rahul Sharma
Email: rahul.sharma@example.com
Branch: CSE
Year: 3rd Year
Join Year: 2023
```

---

## 2. Update Member Form

**Location:** Members page  
**Trigger:** Click the "Edit" button (pencil icon) on any member card

### Two Main Sections:

#### A. Update Statistics

Update member's stats incrementally:

- **Add Events** - Number of events to add to current count
- **Add Contributions** - Number of contributions to add
- **Add Points** - Points to add to current total

Shows current values for reference.

#### B. Add Achievement

Add a new achievement to member's profile:

- **Achievement Title*** (required) - Name of the achievement
- **Description*** (required) - Details about the achievement
- **Category*** (required) - Type of achievement:
  - 🎪 Event - Event-related achievement
  - ✍️ Contribution - Contribution-based achievement
  - 🎯 Leadership - Leadership achievement
  - ⭐ Excellence - Excellence award
- **Icon** - Emoji icon for the achievement (choose from preset list)

### API Endpoints:

- Update stats: `PATCH /api/members/[id]`
- Add achievement: `POST /api/members/[id]/achievement`

### Usage Example:

**Update Stats:**
```
Add Events: 2
Add Contributions: 1
Add Points: 50
```

**Add Achievement:**
```
Title: Best Contributor
Description: Awarded for outstanding contributions in Q1 2024
Category: Contribution
Icon: 🏆
```

---

## 3. Add Progress Form

**Location:** Progress page  
**Trigger:** Click the "Add Progress" button (+ icon) in the top-right corner

### Fields:

- **Month*** (required) - Select month (January-December)
- **Year*** (required) - Year (2020-2025)
- **Events Conducted*** (required) - Number of events in that month
- **Active Members*** (required) - Number of active members
- **Documents Created*** (required) - Number of documents/reports created
- **Target Achievement** - Target completion percentage (0-100)

### Functionality:

- Prevents duplicate entries for same month/year
- Validates target between 0-100%
- Calls `/api/progress` POST endpoint
- Refreshes progress charts on success

### Usage Example:

```
Month: January
Year: 2024
Events Conducted: 3
Active Members: 45
Documents Created: 7
Target Achievement: 85
```

---

## 4. Add Winner Form

**Location:** Leaderboard page  
**Trigger:** Click the "Declare Winner" button (trophy icon)

### Fields:

- **Month*** (required) - Select month for the award
- **Year*** (required) - Year for the award
- **Winner*** (required) - Select from dropdown of members (sorted by points)
  - Shows: Name - Points (Rank #X)
- **Category*** (required) - Award category:
  - 🏆 Overall Performance
  - 🎪 Event Participation
  - ✍️ Contributions
  - 🎯 Leadership
  - 📈 Most Improved
- **Reason** (optional) - Explanation for the award

### Functionality:

- Fetches current members for selected year
- Shows member's current stats in dropdown
- Auto-fills winner details (name, email, points)
- Calls `/api/winners` POST endpoint
- Refreshes monthly winners display on success

### Usage Example:

```
Month: December
Year: 2023
Winner: Priya Patel - 450 pts (Rank #1)
Category: Overall Performance
Reason: Exceptional performance throughout the month with highest event participation and contributions
```

---

## Form Patterns

All forms follow consistent patterns:

### Modal Design
- Opens in centered modal overlay
- Click outside or X button to close
- Prevents closing while loading

### Validation
- Required fields marked with *
- Client-side validation before submission
- Server-side validation in API routes
- Shows error messages via alerts (can be upgraded to toast notifications)

### States
- **Normal** - Form ready for input
- **Loading** - Submission in progress (disabled state)
- **Success** - Data saved, form closes, parent data refreshes
- **Error** - Shows error message, form stays open

### Styling
- Tailwind CSS with IEEE blue theme (#00629B)
- Consistent spacing and typography
- Hover effects on buttons
- Focus rings on inputs
- Responsive design (mobile-friendly)

---

## API Integration

### Request Format
All forms use `POST` or `PATCH` methods with JSON payload:

```javascript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
})
```

### Response Format
APIs return standardized responses:

```json
{
  "success": true,
  "data": { /* created/updated document */ }
}
```

Or on error:

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Future Enhancements

Potential improvements:

1. **Toast Notifications** - Replace alerts with toast notifications
2. **Form Validation Library** - Use Zod or Yup for schema validation
3. **Edit/Delete** - Add edit and delete functionality to existing records
4. **Bulk Operations** - Import multiple members from CSV
5. **File Attachments** - Attach files to achievements
6. **Rich Text Editor** - For descriptions and reasons
7. **Auto-save** - Save form progress to localStorage
8. **Confirmation Dialogs** - Before destructive actions
9. **Loading Skeletons** - Better loading states
10. **Form Analytics** - Track form completion rates

---

## Troubleshooting

### Form Won't Submit

1. Check all required fields are filled
2. Verify network connection
3. Check browser console for errors
4. Ensure MongoDB connection is active
5. Verify API route exists and is correct

### Data Not Refreshing

- Forms call `onSuccess()` callback to refresh parent component
- If data doesn't update, check the callback is fetching latest data
- Clear browser cache if needed

### Validation Errors

- Email must be in valid format (name@domain.com)
- Year must be between 2020-2025
- Target must be 0-100
- All required (*) fields must be filled

---

## Testing Checklist

When testing forms:

- [ ] Form opens correctly
- [ ] All fields are editable
- [ ] Required field validation works
- [ ] Cancel button closes form
- [ ] Submit button shows loading state
- [ ] Success message appears
- [ ] Data refreshes after submission
- [ ] Form closes after success
- [ ] Error handling works for invalid data
- [ ] Form is responsive on mobile devices

---

## Developer Notes

### Adding New Forms

To add a new form:

1. Create component in `/components/YourForm.tsx`
2. Follow the modal pattern with props: `isOpen`, `onClose`, `onSuccess`
3. Add state management in parent page
4. Create corresponding API route
5. Add form trigger button in UI
6. Test all states and edge cases

### Form Component Template

```tsx
'use client'

interface YourFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function YourForm({ isOpen, onClose, onSuccess }: YourFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ /* initial state */ })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Success!')
        onSuccess()
        onClose()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Form content */}
      </div>
    </div>
  )
}
```

---

For any questions or issues, please refer to the main documentation or contact the development team.
