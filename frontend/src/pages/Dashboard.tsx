import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Package, Bone } from 'lucide-react';
import axios from 'axios';

// A mock dashboard showcasing the nature/pet design guidelines requested in the PRD
function Dashboard() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Banner */}
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-nature/20 group">
        <img 
          src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=1200&auto=format&fit=crop" 
          alt="Dogs playing in nature" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-10 md:px-16 text-white max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Chào buổi sáng!</h2>
          <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed">
            Hôm nay là một ngày tuyệt vời để đi dạo cùng các bé. Đừng quên kiểm tra lịch trình thức ăn và tiêm phòng nhé.
          </p>
        </div>
      </div>

      {/* Warnings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white/60 backdrop-blur-md border border-orange-100/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-warm/10 rounded-full blur-2xl group-hover:bg-warm/20 transition-colors" />
           <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
             <AlertCircle size={24} />
           </div>
           <div>
              <h3 className="text-slate-500 text-sm font-bold tracking-wider uppercase mb-1">Cảnh báo khẩn cấp</h3>
              <p className="text-slate-800 font-bold text-xl">Thức ăn của Corgi</p>
              <p className="text-red-500 font-semibold mt-1">Chỉ còn đủ dùng trong 3 ngày!</p>
           </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-nature-light/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer">
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-nature/10 rounded-full blur-2xl group-hover:bg-nature/20 transition-colors" />
           <div className="w-12 h-12 bg-nature-light text-nature-dark rounded-2xl flex items-center justify-center">
             <CalendarClock size={24} />
           </div>
           <div>
              <h3 className="text-slate-500 text-sm font-bold tracking-wider uppercase mb-1">Sắp tới hạn</h3>
              <p className="text-slate-800 font-bold text-xl">Thay nước bể cá Neon</p>
              <p className="text-nature-dark font-semibold mt-1">Sáng ngày mai - Thay 30%</p>
           </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-blue-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-pointer transform">
           <div className="absolute inset-0">
             <img src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-500" />
           </div>
           <div className="relative z-10 w-12 h-12 bg-blue-50/80 backdrop-blur-sm text-blue-600 rounded-2xl flex items-center justify-center">
             <Bone size={24} />
           </div>
           <div className="relative z-10">
              <h3 className="text-slate-500 text-sm font-bold tracking-wider uppercase mb-1">Lịch Y tế</h3>
              <p className="text-slate-800 font-bold text-xl">Tiêm phòng dại (Mèo Mướp)</p>
              <p className="text-blue-600 font-semibold mt-1">Còn lại 12 ngày</p>
           </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
