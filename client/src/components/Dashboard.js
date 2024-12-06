import React from 'react';

const Dashboard = () => {

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Welcome Back {loggedInUser?.name} 👋</h2>
          <p className="text-gray-600">Manage patients and reports here</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;