import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import { useAuth } from '../Services/authContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col pl-64">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 