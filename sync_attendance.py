import pyodbc
import json
import os

# PASTE YOUR ACTUAL DATABASE PATH HERE:
db_path = r'C:\Realtime\Database.accdb'
conn_str = fr'DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={db_path};'

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    # Query the attendance table (Adjust table/column names if your software uses different names)
    cursor.execute('SELECT EmployeeID, PunchDate, PunchTime, Status FROM AttendanceTable')
    rows = cursor.fetchall()

    attendance_data = {}

    for row in rows:
        emp_id = str(row.EmployeeID)
        if emp_id not in attendance_data:
            attendance_data[emp_id] = []

        attendance_data[emp_id].append({
            "date": str(row.PunchDate),
            "time": str(row.PunchTime),
            "status": str(row.Status)
        })

    # Save this data automatically into your React project's public folder
    output_path = os.path.join(os.getcwd(), 'public', 'attendance.json')
    with open(output_path, 'w') as f:
        json.dump(attendance_data, f, indent=4)

    print("Success! attendance.json generated.")

except Exception as e:
    print("Error reading database:", e)