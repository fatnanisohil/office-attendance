import React, { useState, useEffect } from 'react';

// Helper function to hash password input using SHA-256
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [attendanceData, setAttendanceData] = useState({});
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInEmp, setLoggedInEmp] = useState(null);
  const [error, setError] = useState('');

  // Admin states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}attendance.json`)
      .then(res => res.json())
      .then(data => setAttendanceData(data))
      .catch(err => console.error("Error loading attendance data:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('Please enter Employee ID');
      return;
    }
    const cleanId = empId.trim().toUpperCase();
    const empRecord = attendanceData[cleanId];

    if (!empRecord) {
      setError('Invalid Employee ID');
      return;
    }

    const hashedInput = await hashPassword(password);
    if (hashedInput === empRecord.pin_hash) {
      setLoggedInEmp(cleanId);
      setError('');
    } else {
      setError('Incorrect Password / PIN');
    }
  };

  const handleLogout = () => {
    setLoggedInEmp(null);
    setEmpId('');
    setPassword('');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdminAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Incorrect admin password!');
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Employee ID,Name,Designation,Shift,Present Days,Paid Days,Absent,Leaves,Weekly Offs\n";

    Object.entries(attendanceData).forEach(([id, data]) => {
      csvContent += `"${id}","${data.name}","${data.designation}","${data.shift}","${data.present}","${data.paiddays}","${data.absent}","${data.leave}","${data.wo}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_salary_attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Admin Dashboard View
  if (isAdminAuthenticated) {
    const filteredEmployees = Object.entries(attendanceData).filter(([id, data]) =>
      (data.name && data.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Namah Jewellers - Master Attendance & Salary Panel</h2>
          <div>
            <button onClick={exportToCSV} style={{ marginRight: '10px', padding: '8px 15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Download Payroll CSV
            </button>
            <button onClick={() => { setIsAdminAuthenticated(false); setShowAdminLogin(false); }} style={{ padding: '8px 15px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by Employee ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white' }}
        />

        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#374151', color: 'white' }}>
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
                filteredEmployees.map(([id, data]) => (
                  <tr key={id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{data.name}</td>
                    <td style={{ padding: '12px' }}>{data.designation}</td>
                    <td style={{ padding: '12px' }}>{data.shift}</td>
                    <td style={{ padding: '12px', color: '#059669', fontWeight: 'bold' }}>{data.present}</td>
                    <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>{data.paiddays}</td>
                    <td style={{ padding: '12px', color: '#dc2626' }}>{data.absent}</td>
                    <td style={{ padding: '12px' }}>{data.leave}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => setSelectedEmployee({ empId: id, ...data })}
                        style={{ padding: '6px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedEmployee && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
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
                style={{ marginTop: '20px', padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Admin Login View
  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Master Login</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleAdminLogin}>
              {adminError && <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">{adminError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Master Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Login to Admin Panel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Employee Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Employee Login View
  if (!loggedInEmp) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Office Attendance</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Check your punch logs & summary from your phone</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g. NAMAH0011"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password / PIN</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••• (Default is 1234)"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(true)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50"
                >
                  🔐 Admin Portal (Salary & Master Summary)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 4. Logged-in Employee Dashboard View
  const empInfo = attendanceData[loggedInEmp] || {};
  const records = empInfo.records || [];

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <nav className="bg-indigo-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <h1 className="text-white font-bold text-lg">My Attendance & Summary</h1>
          <button
            onClick={handleLogout}
            className="bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-800"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Employee Profile Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Employee ID</p>
              <p className="text-lg font-bold text-gray-900">{loggedInEmp}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-lg font-bold text-gray-900">{empInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Shift Timing</p>
              <p className="text-md font-bold text-indigo-600">{empInfo.shift || 'N/A'}</p>
            </div>
            <div className="sm:col-span-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Designation</p>
              <p className="text-md font-medium text-gray-800">{empInfo.designation || 'N/A'}</p>
            </div>
          </div>

          {/* Summary Grid */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Performance Summary</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold">Present</p>
              <p className="text-xl font-bold text-green-800">{empInfo.present}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">HL</p>
              <p className="text-xl font-bold text-blue-800">{empInfo.hl}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold">WO</p>
              <p className="text-xl font-bold text-purple-800">{empInfo.wo}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-xs text-red-600 font-semibold">Absent</p>
              <p className="text-xl font-bold text-red-800">{empInfo.absent}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-600 font-semibold">Leave</p>
              <p className="text-xl font-bold text-yellow-800">{empInfo.leave}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 col-span-3 sm:col-span-1">
              <p className="text-xs text-indigo-600 font-semibold">Paid Days</p>
              <p className="text-xl font-bold text-indigo-800">{empInfo.paiddays}</p>
            </div>
          </div>
        </div>

        {/* Punch History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Punch History</h3>
          <div className="space-y-3">
            {records.map((rec, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">{rec.date}</p>
                  <p className="text-xs text-gray-500">{rec.time}</p>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    rec.status === 'P' ? 'bg-green-100 text-green-800' :
                    rec.status === 'A' ? 'bg-red-100 text-red-800' :
                    rec.status === 'WO' ? 'bg-purple-100 text-purple-800' :
                    rec.status === 'HLD' || rec.status === 'POH' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}