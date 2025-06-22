#!/usr/bin/env python3
"""
Setup script for Co-Founder Matching MCP Server

This script helps set up the project and check dependencies.
"""

import os
import sys
import subprocess
import requests
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_mongodb_connection():
    """Check if MongoDB Atlas is accessible"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import asyncio
        
        async def test_connection():
            # Get MongoDB URL from environment or use default
            mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://username:password@cluster.mongodb.net/cofounder_matching")
            
            # Skip test if using default placeholder URL
            if "username:password" in mongodb_url:
                print("⚠️  MongoDB URL not configured yet")
                return False
            
            client = AsyncIOMotorClient(mongodb_url)
            try:
                await client.admin.command('ping')
                return True
            except Exception as e:
                print(f"❌ MongoDB connection failed: {e}")
                return False
            finally:
                client.close()
        
        result = asyncio.run(test_connection())
        if result:
            print("✅ MongoDB Atlas connection successful")
            return True
        else:
            return False
    except ImportError:
        print("⚠️  MongoDB driver not installed yet")
        return False
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creating .env file...")
        try:
            with open("env.example", "r") as f:
                example_content = f.read()
            
            with open(".env", "w") as f:
                f.write(example_content)
            
            print("✅ .env file created from template")
            print("⚠️  Please edit .env file with your MongoDB Atlas connection details")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return False
    else:
        print("✅ .env file already exists")
        return True

def test_server():
    """Test if the server can start"""
    print("🧪 Testing server startup...")
    try:
        # Import the app to check for syntax errors
        from app.main import app
        print("✅ Server imports successfully")
        return True
    except Exception as e:
        print(f"❌ Server import failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Co-Founder Matching MCP Server Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        sys.exit(1)
    
    # Test server
    if not test_server():
        sys.exit(1)
    
    # Check MongoDB connection
    if not check_mongodb_connection():
        print("\n⚠️  MongoDB Atlas Setup Required:")
        print("1. Create a MongoDB Atlas account at: https://www.mongodb.com/atlas")
        print("2. Create a new cluster (free tier available)")
        print("3. Get your connection string from Atlas dashboard")
        print("4. Update .env file with your connection string")
        print("\nExample connection string format:")
        print("MONGODB_URL=mongodb+srv://your_username:your_password@your_cluster.abc123.mongodb.net/cofounder_matching")
        print("\nMake sure to:")
        print("- Replace 'your_username' and 'your_password' with your Atlas credentials")
        print("- Replace 'your_cluster.abc123.mongodb.net' with your actual cluster URL")
        print("- Add your IP address to Atlas Network Access whitelist")
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed!")
    print("\nNext steps:")
    print("1. Configure MongoDB Atlas connection in .env file")
    print("2. Start the server: python run_server.py")
    print("3. Test the API: python test_api.py")
    print("4. View docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main() 