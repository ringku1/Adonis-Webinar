# RTK Integration Testing Guide

## What I've Implemented

✅ **Meeting.tsx Component Updates:**
1. **Backend API Integration**: Now calls your `joinWebinar` endpoint to get Cloudflare credentials
2. **Join Meeting Button**: User clicks to join when meeting starts
3. **RTK Initialization**: Uses actual Cloudflare response data to initialize RTK
4. **Better Error Handling**: Shows retry button on failures
5. **Console Logging**: Added logs to help debug API responses

## Testing Steps

### 1. Test the Flow
1. **Start Backend**: `cd webinar-backend && npm run dev`
2. **Start Frontend**: `cd webinar-frontend && npm start`
3. **Create a Webinar** (set start time to current time + 1 minute)
4. **Register for the Webinar**
5. **Click the Join Link** when meeting starts
6. **Click "Join Meeting"** button when it appears

### 2. Debug the API Response
Open browser console and check:
```
Meeting data received: [Cloudflare API response]
Initializing meeting with config: [RTK config]
```

### 3. Expected API Flow
```
POST /webinar/{webinarId}/join
Request: { name: "...", email: "..." }

Response: {
  status: 'joined',
  message: 'Successfully joined the meeting',
  meeting_data: { /* Cloudflare RTK response */ },
  participant: { /* participant info */ }
}
```

## Common Issues & Solutions

### Issue 1: "Failed to initialize RTK meeting"
**Solution**: Check browser console logs for the actual error
- Verify Cloudflare credentials in backend `.env`
- Check `meeting_data` structure in console

### Issue 2: RTK Component Not Rendering  
**Solution**: 
- Check if `meetingInitialized` and `meeting` states are true
- Verify RTK config structure matches Cloudflare expectations

### Issue 3: Backend API Error
**Solution**:
- Test backend endpoint directly with Postman
- Verify CF_API_BASE and CF_AUTH_HEADER in backend `.env`
- Check participant exists in database

## Environment Variables Needed

**Backend (.env):**
```
CF_API_BASE=https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID
CF_AUTH_HEADER=Bearer YOUR_API_TOKEN
cf_meeting_id=YOUR_MEETING_ID
JWT_SECRET=your_jwt_secret
```

## Next Steps

1. **Test the Join Flow** - Click "Join Meeting" and check console logs
2. **Verify API Response** - Check what `meeting_data` contains
3. **Debug RTK Config** - Ensure RTK receives correct session data
4. **UI Testing** - Verify meeting interface renders properly

If you encounter issues, share:
1. Browser console logs
2. Backend API response structure
3. Any error messages

The key debugging points are in the browser console where we log the Cloudflare API response structure.
