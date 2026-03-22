import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Search, Compass, Film, MessageSquare, Heart, PlusSquare, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Film, label: 'Reels', path: '/reels' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Heart, label: 'Notifications', path: '/notifications' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-gray-900">
      {/* Sidebar Navigation */}
      <nav className="flex flex-col h-full w-[72px] lg:w-[244px] border-r border-gray-200 px-3 py-6 shrink-0 transition-all duration-300">
        <div className="flex items-center mb-8 px-3 lg:px-4">
          {/* Logo */}
          <h1 className="hidden lg:block text-2xl font-bold font-serif tracking-tight">BharatFlow</h1>
          <div className="lg:hidden mx-auto p-1 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
             <div className="bg-white p-1 rounded-lg flex items-center justify-center">
                 <Film size={24} className="text-gray-900" />
             </div>
          </div>
        </div>

        <div className="flex flex-col flex-grow gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors group ${
                    isActive ? 'font-bold' : 'font-normal'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="hidden lg:block text-[15px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-2">
           <button
             onClick={handleLogout}
             className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
           >
             <LogOut size={24} className="shrink-0" />
             <span className="hidden lg:block text-[15px]">Log out</span>
           </button>

           <button className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
             <Menu size={24} className="shrink-0" />
             <span className="hidden lg:block text-[15px]">More</span>
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 flex justify-center">
        <div className="w-full max-w-[935px] py-8 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
