import time
import subprocess

while True:
    print("Running attendance sync and deploy...")
    try:
        subprocess.run(["python", "sync_attendance.py"], check=True)
        # Added shell=True so Windows can execute npm.cmd correctly
        subprocess.run(["npm", "run", "deploy"], shell=True, check=True)
        print("Successfully updated and deployed live!")
    except Exception as e:
        print(f"Error during deployment: {e}")
    
    # Wait for 1 hour (3600 seconds)
    time.sleep(3600)