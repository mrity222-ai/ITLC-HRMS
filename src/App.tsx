import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import EmployeeApp from './components/employee/EmployeeApp';
import AdminApp from './components/admin/AdminApp';
import ManagerApp from './components/manager/ManagerApp';
import { App as SuperownerApp } from './components/superowner/SuperownerApp';
import { DashboardProvider } from './components/superowner/context/DashboardContext';
import { api } from './services/api';

export default function App() {
  const [view, setView] = useState<'login' | 'superowner-login' | 'employee' | 'admin' | 'superowner' | 'manager'>('login');
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('hrms_jwt_token');
      if (token) {
        const profile = await api.getProfile();
        setLoggedInEmail(profile.email);
        const path = window.location.pathname;
        const search = window.location.search;
        const isSuperownerRoute = path === '/superowner' || search.includes('superowner');

        if (isSuperownerRoute) {
          if (profile.role === 'Super Owner') {
            setView('superowner');
          } else {
            localStorage.removeItem('hrms_jwt_token');
            setView('superowner-login');
          }
        } else {
          if (profile.role === 'Super Owner') {
            setView('superowner');
          } else if (profile.role === 'Company Admin' || profile.role === 'HR') {
            setView('admin');
          } else if (profile.role === 'Manager') {
            setView('manager');
          } else {
            setView('employee');
          }
        }
      } else {
        const path = window.location.pathname;
        const search = window.location.search;
        if (path === '/superowner' || search.includes('superowner')) {
          setView('superowner-login');
        } else {
          setView('login');
        }
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
      localStorage.removeItem('hrms_jwt_token');
      setView('login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSuccessLogin = () => {
    loadProfile();
  };

  const handleLogout = async () => {
    await api.logout();
    setLoggedInEmail('');
    setView('login');
    loadProfile();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fafbfc] gap-4 font-sans">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading HRMS Workspace...</span>
      </div>
    );
  }

  if (view === 'employee') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <EmployeeApp loggedInEmail={loggedInEmail} onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <AdminApp onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'manager') {
    return (
      <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
        <ManagerApp onLogout={handleLogout} />
      </div>
    );
  }

  if (view === 'superowner') {
    return (
      <DashboardProvider>
        <div className="dashboard-theme flex-grow min-h-screen flex flex-col">
          <SuperownerApp onLogout={handleLogout} />
        </div>
      </DashboardProvider>
    );
  }

  return (
    <main className="h-screen w-full flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#fafbfc] text-slate-800 relative font-sans overflow-hidden">
      {/* Bounded background visual elements container to prevent unwanted scroll extensions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle global grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Ambient background glow & floating abstract blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/8 blur-[120px]" />
        
        {/* Floating abstract blobs */}
        <div className="hidden md:block absolute top-1/4 left-[5%] w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-300/12 to-purple-300/8 blur-[90px] animate-blob-1" />
        <div className="hidden md:block absolute bottom-1/4 right-[5%] w-80 h-80 rounded-full bg-gradient-to-tr from-purple-300/10 to-pink-300/8 blur-[100px] animate-blob-2" />
        <div className="hidden md:block absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-300/8 to-indigo-300/10 blur-[80px] animate-blob-3" />
      </div>

      {/* Main card centered on screen */}
      <div className="w-full max-w-[480px] sm:max-w-[540px] md:max-w-3xl lg:max-w-[960px] h-auto relative z-10 flex items-center justify-center mx-auto">
        <LoginForm 
          onSuccessLogin={handleSuccessLogin} 
          isSuperownerMode={view === 'superowner-login'} 
        />
      </div>
    </main>
  );
}
