import { Outlet, Link, useLocation } from 'react-router-dom';
import { Workflow, ScrollText, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', path: '/workflows', icon: Workflow },
    { name: 'Execution Logs', path: '/logs', icon: ScrollText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Workflow className="w-6 h-6 text-primary-600 mr-2" />
          <span className="text-lg font-bold text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 py-1">Halleyx Engine</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
