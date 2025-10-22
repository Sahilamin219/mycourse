# Creating Test Users for DebateHub

Since Supabase requires proper authentication setup, you'll need to create test users through the Supabase Dashboard.

## Steps to Create Test Users:

1. **Go to Supabase Dashboard**
   - Visit: https://flodnpccduurseogzlfx.supabase.co
   - Sign in to your Supabase account

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create First User**
   - Click "Add User" button
   - Enter email: `user1@test.com`
   - Enter password: `password123`
   - Check "Auto Confirm User" (so they don't need to verify email)
   - Click "Create User"

4. **Create Second User**
   - Click "Add User" button again
   - Enter email: `user2@test.com`
   - Enter password: `password123`
   - Check "Auto Confirm User"
   - Click "Create User"

## Testing the App:

1. **Device 1 (or Browser 1)**
   - Open the app
   - Click "Sign In"
   - Use: user1@test.com / password123
   - Click "Start Debate Now"
   - Select a topic
   - Click "Start Debate Now"

2. **Device 2 (or Browser 2 - Incognito)**
   - Open the app in another browser/incognito window
   - Click "Sign In"
   - Use: user2@test.com / password123
   - Click "Start Debate Now"
   - Select the SAME topic
   - Click "Start Debate Now"

3. **Start WebSocket Server**
   ```bash
   cd backend
   python websocket_server.py
   ```

Both users should now be matched and connected in a video call!

## Alternative: Use Supabase Auth Admin API

You can also create users programmatically using the Supabase dashboard's SQL editor:

```sql
-- This must be run in Supabase Dashboard SQL Editor with proper permissions
```

For security reasons, it's best to create users through the Supabase Dashboard UI as described above.
