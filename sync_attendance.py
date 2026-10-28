import pandas as pd
import json
import os

excel_path = 'attendance_report.xlsx'

print("1. Reading department sheets and extracting employee details & summary totals...")
try:
    xls = pd.ExcelFile(excel_path)
    attendance_data = {}
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
        
        i = 0
        while i < len(df):
            val = df.iloc[i, 2] if len(df.columns) > 2 else None
            if isinstance(val, str) and val.startswith("NAMAH"):
                emp_id = val.strip()
                name = str(df.iloc[i, 3]).strip() if pd.notna(df.iloc[i, 3]) else ""
                desig = str(df.iloc[i, 9]).strip() if len(df.columns) > 9 and pd.notna(df.iloc[i, 9]) else ""
                
                # Summary totals from your Excel sheet layout
                present = str(df.iloc[i, 14]).strip() if len(df.columns) > 14 and pd.notna(df.iloc[i, 14]) else "0"
                hl = str(df.iloc[i, 17]).strip() if len(df.columns) > 17 and pd.notna(df.iloc[i, 17]) else "0"
                wo = str(df.iloc[i, 19]).strip() if len(df.columns) > 19 and pd.notna(df.iloc[i, 19]) else "0"
                absent = str(df.iloc[i, 21]).strip() if len(df.columns) > 21 and pd.notna(df.iloc[i, 21]) else "0"
                leave = str(df.iloc[i, 23]).strip() if len(df.columns) > 23 and pd.notna(df.iloc[i, 23]) else "0"
                paiddays = str(df.iloc[i, 27]).strip() if len(df.columns) > 27 and pd.notna(df.iloc[i, 27]) else "0"
                
                dates_row = df.iloc[i+1].values if i+1 < len(df) else []
                arrive_row = df.iloc[i+2].values if i+2 < len(df) else []
                dept_row = df.iloc[i+3].values if i+3 < len(df) else []
                status_row = df.iloc[i+6].values if i+6 < len(df) else []
                
                emp_records = []
                for col_idx in range(3, len(dates_row)):
                    day_val = dates_row[col_idx]
                    if pd.notna(day_val):
                        try:
                            day_num = str(int(day_val)).zfill(2)
                            date_str = f"2026-10-{day_num}"
                            
                            arr_val = arrive_row[col_idx] if col_idx < len(arrive_row) else "00:00"
                            dep_val = dept_row[col_idx] if col_idx < len(dept_row) else "00:00"
                            s_val = status_row[col_idx] if col_idx < len(status_row) else "A"
                            
                            arr_str = str(arr_val).strip() if pd.notna(arr_val) and str(arr_val).strip() != "00:00" else "--:--"
                            dep_str = str(dep_val).strip() if pd.notna(dep_val) and str(dep_val).strip() != "00:00" else "--:--"
                            status_str = str(s_val).strip() if pd.notna(s_val) else "A"
                            
                            emp_records.append({
                                "date": date_str,
                                "time": f"Arr: {arr_str}  |  Dept: {dep_str}",
                                "status": status_str
                            })
                        except:
                            pass
                            
                attendance_data[emp_id] = {
                    "name": name,
                    "designation": desig,
                    "present": present,
                    "hl": hl,
                    "wo": wo,
                    "absent": absent,
                    "leave": leave,
                    "paiddays": paiddays,
                    "records": emp_records
                }
                    
            i += 1

    public_dir = os.path.join(os.getcwd(), 'public')
    os.makedirs(public_dir, exist_ok=True)
    output_path = os.path.join(public_dir, 'attendance.json')
    
    with open(output_path, 'w') as f:
        json.dump(attendance_data, f, indent=4)

    print("2. Success! attendance.json generated with employee details and summary totals.")

except Exception as e:
    print("CRITICAL ERROR:", e)