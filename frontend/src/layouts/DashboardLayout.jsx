import React, { useState } from 'react';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, sidebar }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSidebar = () => {
    if (!sidebar) return null;
    if (React.isValidElement(sidebar)) {
      return React.cloneElement(sidebar, { 
        onNavigate: () => setIsSidebarOpen(false),
        onClose: () => setIsSidebarOpen(false)
      });
    }
    if (typeof sidebar === 'function') {
      const SidebarComponent = sidebar;
      return <SidebarComponent onNavigate={() => setIsSidebarOpen(false)} onClose={() => setIsSidebarOpen(false)} />;
    }
    return sidebar;
  };

  return (
    <div className="h-screen w-full bg-transparent flex overflow-hidden relative z-1">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sticky/Fixed Sidebar container: Stays pinned to the screen at all times */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-30 h-screen shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebar()}
      </aside>

      {/* Main content container - Only this scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Mobile top header bar */}
        <div className="lg:hidden p-4 border-b border-white/10 bg-[#050a1e]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
              VolunteerConnect
            </span>
          </div>
        </div>
        
        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
