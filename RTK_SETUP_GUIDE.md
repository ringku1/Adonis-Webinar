# Cloudflare RealtimeKit (RTK) Setup Guide

## What I've Fixed in Your Code

### 1. **Meeting.tsx Component**
- ✅ **Fixed RTK Integration**: Uncommented and properly structured the RTK components
- ✅ **Added Proper State Management**: Added `meetingInitialized` and `participant` states
- ✅ **Meeting Initialization**: Created `initializeRTKMeeting()` function
- ✅ **Better Error Handling**: Added error handling for meeting initialization
- ✅ **Responsive UI**: Added proper loading states and meeting container

### 2. **CSS Improvements**
- ✅ **Meeting Container Styles**: Full-screen video meeting experience
- ✅ **Responsive Design**: Mobile-friendly meeting view
- ✅ **Loading States**: Better visual feedback during initialization

### 3. **Environment Configuration**
- ✅ **Frontend .env**: Created template for React environment variables
- ✅ **Backend .env**: Added Cloudflare and JWT configuration

## Setup Steps Required

### Step 1: Get Cloudflare RealtimeKit Credentials

1. **Sign up/Login** to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Navigate** to Stream → Calls/RealtimeKit section
3. **Create an App** and get your:
   - `APP_ID` (Application ID)
   - `API_TOKEN` (API Token)

### Step 2: Configure Environment Variables

**Frontend (.env file):**
```bash
# Copy .env.example to .env
cp webinar-frontend/.env.example webinar-frontend/.env

# Edit the .env file with your actual values
REACT_APP_CLOUDFLARE_APP_ID=your_actual_app_id
REACT_APP_CLOUDFLARE_API_TOKEN=your_actual_api_token
REACT_APP_API_URL=http://localhost:3333
```

**Backend (.env file):**
```bash
# Copy .env.example to .env
cp webinar-backend/.env.example webinar-backend/.env

# Add your actual values
JWT_SECRET=your_jwt_secret_here
CF_APP_ID=your_cloudflare_app_id
CF_API_TOKEN=your_cloudflare_api_token
cf_meeting_id=your_default_meeting_id
```

### Step 3: Test the Integration

1. **Start Backend:**
   ```bash
   cd webinar-backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd webinar-frontend
   npm start
   ```

3. **Test Flow:**
   - Create a webinar
   - Register for it
   - Join when meeting starts
   - RTK components should now render properly

## Current RTK Implementation

### Features Working:
- ✅ Token verification
- ✅ Meeting initialization
- ✅ RTK component rendering
- ✅ Participant management
- ✅ Responsive design

### RTK Configuration Options:
```typescript
config={{
  ...defaultConfig,
  layout: 'grid',           // or 'speaker-view'
  showParticipantCount: true,
  showMeetingTimer: true,
}}
```

## Troubleshooting

### Common Issues:

1. **"Failed to initialize RTK meeting"**
   - Check your Cloudflare credentials
   - Verify APP_ID and API_TOKEN are correct

2. **Meeting component not rendering**
   - Ensure the meeting has started (check start_time)
   - Check browser console for errors

3. **Responsive issues**
   - Clear browser cache
   - Test on different screen sizes

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API endpoints with Postman
4. Check network tab for RTK API calls

## Next Steps (Optional Enhancements)

1. **Custom RTK Themes**: Customize the meeting UI appearance
2. **Recording Features**: Add meeting recording functionality
3. **Screen Sharing**: Implement screen sharing controls
4. **Chat Integration**: Add text chat to meetings
5. **Breakout Rooms**: Implement breakout room functionality

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test with a simple meeting first
4. Refer to [Cloudflare RTK Documentation](https://developers.cloudflare.com/calls/)
