import React, { useState } from 'react';
import { Menu, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="h-screen w-full bg-transparent flex overflow-hidden relative z-1 text-[#354052]">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#354052]/30 z-40 lg:hidden backdrop-blur-sm transition-opacity"
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
        <div className="lg:hidden p-4 border-b border-[#E6E8EC] bg-white/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-[#667085] hover:text-[#354052] rounded-xl hover:bg-[#F5F1FA] transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#BFD8C2]/40 border border-[#BFD8C2] flex items-center justify-center text-[#26372B]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-[#354052] tracking-tight">
                Volunteer<span className="text-[#5b7f63]">Connect</span>
              </span>
            </Link>
          </div>
        </div>
        
        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="w-full max-w-[1700px] mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
