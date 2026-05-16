# MongoDB Atlas Setup

## Step 1: Copy Connection String from MongoDB Atlas
- Go to https://cloud.mongodb.com
- Click "Connect" → "Drivers"
- Copy the connection string

## Step 2: Set in Render Dashboard
Go to Render → Your Service → Environment → Add/Edit Variable:

**Key:** `MONGO_URI`

**Value (encoded):**
```
mongodb+srv://nschorsingh1_db_user:Naman%40%401234%40%40cluster0.x7qhvoi.mongodb.net/?appName=Cluster0
```

**If you want to use your raw password instead (replace `Naman%40%401234%40%40`):**
Encode any `@` in your password as `%40` before the `@cluster0...` part.

## Verify
After setting, redeploy on Render. Check logs for:
```
Connected to MongoDB
```
