import React, { useState, useEffect } from 'react';
import './AdminPanel.css'; // Optional: for custom styling if needed

function AdminPanel({ onBack }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch attendance.json on load
  useEffect(() => {
    fetch('./attendance.json')
      .then((res) => res.json())
      .then((data) => setAttendanceData(data))
      .catch((err) => console.error('Error loading attendance data:', err));
  }, []);

  // Handle Admin Login (Change "admin123" to your secure master password)
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdminAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect admin password!');
    }
  };

  // Export Table to CSV for Salary Calculation
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Employee ID,Name,Designation,Shift,Present Days,Paid Days,Absent,Leaves,Weekly Offs\n";

    Object.entries(attendanceData).forEach(([empId, data]) => {
      csvContent += `"${empId}","${data.name}","${data.designation}","${data.shift}","${data.present}","${data.paiddays}","${data.absent}","${data.leave}","${data.wo}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_salary_attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-login-container" style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>Admin Master Login</h2>
        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Master Password:</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Login to Admin Panel
          </button>
        </form>
        <button onClick={onBack} style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Employee Login
        </button>
      </div>
    );
  }

  const filteredEmployees = Object.entries(attendanceData).filter(([empId, data]) =>
    data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Namah Jewellers - Master Attendance & Salary Panel</h2>
        <div>
          <button onClick={exportToCSV} style={{ marginRight: '10px', padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Download Payroll CSV
          </button>
          <button onClick={onBack} style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout / Exit
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Employee ID or Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
      />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Emp ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Designation</th>
              <th style={{ padding: '12px' }}>Shift</th>
              <th style={{ padding: '12px' }}>Present</th>
              <th style={{ padding: '12px' }}>Paid Days</th>
              <th style={{ padding: '12px' }}>Absent</th>
              <th style={{ padding: '12px' }}>Leaves</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(([empId, data]) => (
                <tr key={empId} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{empId}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{data.name}</td>
                  <td style={{ padding: '12px' }}>{data.designation}</td>
                  <td style={{ padding: '12px' }}>{data.shift}</td>
                  <td style={{ padding: '12px', color: 'green', fontWeight: 'bold' }}>{data.present}</td>
                  <td style={{ padding: '12px', color: '#007bff', fontWeight: 'bold' }}>{data.paiddays}</td>
                  <td style={{ padding: '12px', color: 'red' }}>{data.absent}</td>
                  <td style={{ padding: '12px' }}>{data.leave}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => setSelectedEmployee({ empId, ...data })}
                      style={{ padding: '6px 12px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      View Logs
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Section for Individual Detailed Logs */}
      {selectedEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3>Detailed Logs: {selectedEmployee.name} ({selectedEmployee.empId})</h3>
            <p><strong>Designation:</strong> {selectedEmployee.designation} | <strong>Paid Days:</strong> {selectedEmployee.paiddays}</p>
            <hr style={{ margin: '15px 0' }} />
            <h4>Punch Records:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {selectedEmployee.records.map((rec, index) => (
                <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{rec.date}</span>
                  <span>{rec.time}</span>
                  <span style={{ fontWeight: 'bold', color: rec.status === 'A' ? 'red' : 'green' }}>{rec.status}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedEmployee(null)}
              style={{ marginTop: '20px', padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;