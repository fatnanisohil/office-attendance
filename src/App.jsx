import React, { useState, useEffect } from 'react';

export default function App() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./attendance.json')
      .then((res) => res.json())
      .then((data) => {
        setAllData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading attendance data:", err);
        setLoading(false);
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (allData[employeeId]) {
      setUser(employeeId);
    } else {
      alert("Employee ID not found in records. Please check your ID.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading attendance portal...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center px-6 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-slate-900">Office Attendance</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Check your punch logs from your phone</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your Employee ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password / PIN</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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

  const employeeLogs = allData[user] || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-bold">My Attendance</h1>
        <button 
          onClick={() => setUser(null)}
          className="text-xs bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
        >
          Logout
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 uppercase font-semibold">Employee ID</p>
          <h2 className="text-xl font-bold text-slate-800">{user}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-700">Punch History</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {employeeLogs.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No attendance records found.</p>
            ) : (
              employeeLogs.map((log, index) => (
                <div key={index} className="p-4 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{log.date}</p>
                    <p className="text-xs text-slate-500">Time: {log.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    log.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {log.status || 'Punched'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}