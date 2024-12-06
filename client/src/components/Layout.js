import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]); //to logout of all tabs

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="flex items-center space-x-12">
        <div className="text-2xl font-bold">
          <span className="text-blue-600">Med</span>
          <span className="text-teal-600">Report</span>
        </div>
        <div className="flex space-x-8">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'text-white bg-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/patients" 
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/patients' 
                ? 'text-white bg-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Patients
          </Link>
          <Link 
            to="/reports" 
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/reports' 
                ? 'text-white bg-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reports
          </Link>
        </div>
      </div>
      <div>
        <button 
          onClick={onLogout} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {
    name: 'John Smith',
    role: 'Doctor'
  };

  const handleLogout = () => {
   
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    

    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <Outlet />
    </div>
  );
};

export default Layout;
