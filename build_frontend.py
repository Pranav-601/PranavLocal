#!/usr/bin/env python3
"""
Simple script to rebuild the React frontend for the Flask backend.
Run this whenever you make changes to the React frontend.
"""

import os
import subprocess
import sys

def main():
    # Get the frontend directory
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')
    
    if not os.path.exists(frontend_dir):
        print("❌ Frontend directory not found!")
        return 1
    
    print("🔧 Building React frontend...")
    print(f"📁 Frontend directory: {frontend_dir}")
    
    try:
        # Change to frontend directory and run build
        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=frontend_dir,
            check=True,
            capture_output=True,
            text=True
        )
        
        print("✅ Frontend build successful!")
        print("🚀 You can now run 'python app.py' to start the server with the updated frontend.")
        return 0
        
    except subprocess.CalledProcessError as e:
        print("❌ Build failed!")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return 1
    except FileNotFoundError:
        print("❌ npm not found! Make sure Node.js and npm are installed.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
