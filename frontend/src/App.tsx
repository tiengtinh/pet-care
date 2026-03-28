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
      <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans">
        <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="sticky top-0 z-20 flex w-full shrink-0 flex-col gap-4 border-b border-orange-50/50 bg-white/90 px-4 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl md:h-screen md:w-64 md:items-center md:gap-6 md:overflow-y-auto md:border-b-0 md:border-r md:px-0 md:py-8 md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex w-full items-center gap-3 md:mb-6 md:px-8">
            <div className="w-12 h-12 bg-gradient-to-br from-warm to-warm-dark rounded-2xl flex items-center justify-center shadow-lg shadow-warm/30">
              <PawPrint className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-warm-dark to-slate-700 bg-clip-text text-transparent tracking-tight">PetCare</h1>
          </div>
          
          <nav className="flex w-full gap-2 overflow-x-auto pb-1 text-slate-500 font-semibold tracking-wide md:flex-col md:px-4 md:pb-0">
            <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
            <NavItem to="/pets" icon={<PawPrint size={20} />} label="Thú Cưng" />
            <NavItem to="/inventory" icon={<PackageOpen size={20} />} label="Kho Thức Ăn" />
            <NavItem to="/schedules" icon={<CalendarClock size={20} />} label="Lịch Trình" />
          </nav>

          <div className="hidden w-full px-6 opacity-80 transition-opacity hover:opacity-100 md:mt-auto md:block">
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
        <main className="relative w-full flex-1 overflow-hidden">
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
      className={`flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 group md:min-w-0
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
