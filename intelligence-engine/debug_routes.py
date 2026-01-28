import sys
import os

# Add current directory to path to find main
sys.path.append(os.getcwd())

try:
    from main import app
    print("Registered Routes:")
    for route in app.routes:
        methods = getattr(route, "methods", None)
        print(f"{route.path} {methods}")
except Exception as e:
    print(f"Error loading app: {e}")
