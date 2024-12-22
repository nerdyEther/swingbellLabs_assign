import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        navigate('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const navLinks = [
    { to: '/', text: 'Dashboard' },
    { to: '/patients', text: 'Patients' },
    { to: '/reports', text: 'Reports' },
  ];

  const NavLink = ({ to, children }) => (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-lg transition-colors ${
        location.pathname === to 
          ? 'text-white bg-blue-600' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="relative flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="flex items-center space-x-12 flex-grow">
   
        <div className="text-2xl font-bold">
          <span className="text-blue-600">Med</span>
          <span className="text-teal-600">Report</span>
        </div>

   
        <div className="hidden md:flex space-x-8">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to}>{link.text}</NavLink>
          ))}
        </div>
      </div>

 
      <div className="hidden md:block">
        <button 
          onClick={onLogout} 
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>


      <button 
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

   
      {isMenuOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 p-4 bg-white border-b shadow-lg md:hidden z-50">
          <div className="flex flex-col space-y-4">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to}>{link.text}</NavLink>
            ))}
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
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