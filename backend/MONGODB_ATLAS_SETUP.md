# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for the Co-Founder Matching MCP Server.

## 🚀 Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Fill in your details and create account

### 2. Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### 3. Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### 4. Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 5. Get Your Connection String

1. Go back to "Database" in the sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### 6. Update Your .env File

Replace the placeholder in your `.env` file:

```env
# Replace this:
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/cofounder_matching

# With your actual connection string:
MONGODB_URL=mongodb+srv://your_username:your_password@your_cluster.abc123.mongodb.net/cofounder_matching
```

**Important**: Replace `your_username`, `your_password`, and `your_cluster.abc123.mongodb.net` with your actual values.

## 🔧 Example Connection String

Your connection string should look like this:
```
mongodb+srv://john_doe:myPassword123@cluster0.abc123.mongodb.net/cofounder_matching
```

Where:
- `john_doe` = your database username
- `myPassword123` = your database password  
- `cluster0.abc123.mongodb.net` = your cluster URL
- `cofounder_matching` = database name

## 🧪 Test Your Connection

Run the setup script to test your connection:

```bash
python setup.py
```

If successful, you'll see:
```
✅ MongoDB Atlas connection successful
```

## 🚨 Common Issues

### Connection Failed
- Check your username and password
- Make sure you added your IP to Network Access
- Verify the cluster URL is correct

### Authentication Failed
- Double-check your database username and password
- Make sure you created a database user (not just an Atlas account)

### Network Access Denied
- Add your IP address to Network Access
- For development, you can allow access from anywhere (0.0.0.0/0)

## 📊 Database Collections

Once connected, the system will automatically create these collections:

- `users` - User profiles
- `user_embeddings` - AI embeddings for matching
- `swipe_history` - User swipe decisions

## 🔒 Security Notes

For production:
- Use specific IP addresses instead of 0.0.0.0/0
- Create database users with minimal required permissions
- Enable MongoDB Atlas security features

For development:
- The current setup is fine for testing and development
- No additional security configuration needed 