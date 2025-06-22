#!/usr/bin/env python3
"""
Fix the .env file with correct MongoDB Atlas connection
"""

import os

# Create .env file with the correct MongoDB Atlas connection
env_content = """# Co-Founder Matching MCP Server Configuration

# Server Configuration
HOST=localhost
PORT=8000
RELOAD=true

# MongoDB Atlas Configuration
MONGODB_URL=mongodb+srv://vaibhav:GiAr2e0PpsWuB2zb@cluster0.pjxhtwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DATABASE_NAME=Profile

# Logging
LOG_LEVEL=info
"""

# Write .env file
with open('.env', 'w') as f:
    f.write(env_content)

print("✅ Fixed .env file with correct MongoDB Atlas connection!")
print("=" * 60)
print("📄 Updated .env file contents:")
print(env_content)
print("=" * 60)
print("🚀 Next steps:")
print("1. Restart your server: python run_server.py")
print("2. Test the connection: python list_users.py") 