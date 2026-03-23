import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PawPrint, PackageOpen, CalendarClock, Home } from 'lucide-react';
import React from 'react';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PetsPage = React.lazy(() => import('./pages/PetsPage'));
const InventoryPage = React.lazy(() => import('./pages/InventoryPage'));
const SchedulesPage = React.lazy(() => import('./pages/SchedulesPage'));

function App() {
  return (
    <Router>
      <div className="flex bg-[#FDFBF7] min-h-screen text-slate-800 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col items-center py-8 gap-6 z-20 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto border-r border-orange-50/50">
          <div className="flex items-center gap-3 w-full px-8 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-warm to-warm-dark rounded-2xl flex items-center justify-center shadow-lg shadow-warm/30">
              <PawPrint className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-warm-dark to-slate-700 bg-clip-text text-transparent tracking-tight">VibeCRM</h1>
          </div>
          
          <nav className="flex flex-col w-full px-4 gap-2 text-slate-500 font-semibold tracking-wide">
            <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
            <NavItem to="/pets" icon={<PawPrint size={20} />} label="Thú Cưng" />
            <NavItem to="/inventory" icon={<PackageOpen size={20} />} label="Kho Thức Ăn" />
            <NavItem to="/schedules" icon={<CalendarClock size={20} />} label="Lịch Trình" />
          </nav>

          <div className="mt-auto px-6 w-full opacity-80 hover:opacity-100 transition-opacity">
            <div className="relative rounded-2xl overflow-hidden shadow-sm group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=300&auto=format&fit=crop" 
                alt="Nature" 
                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute bottom-4 left-4 z-20">
                <p className="text-white text-xs font-bold font-mono tracking-wider">CARE WITH LOVE</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-nature/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-warm/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative h-full w-full z-10 overflow-auto scrollbar-hide">
             <React.Suspense fallback={<div className="p-8">Loading...</div>}>
               <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pets" element={<PetsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/schedules" element={<SchedulesPage />} />
              </Routes>
             </React.Suspense>
          </div>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
        ${isActive ? 'bg-warm text-white shadow-md shadow-warm/20' : 'hover:bg-orange-50/80 hover:text-warm-dark'}`}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
        {icon}
      </div>
      <span className={isActive ? 'font-bold' : ''}>{label}</span>
    </Link>
  );
}

export default App;
