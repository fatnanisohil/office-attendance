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

    // Hash entered password and compare with stored pin_hash
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

  if (!loggedInEmp) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Office Attendance</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your Employee ID & PIN to check attendance</p>
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
                    placeholder="•••• (Default is ....)"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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