import { useEffect, useState } from 'react';
import { AlertCircle, Bone, CalendarClock, PawPrint } from 'lucide-react';

import { getInventoryByPet, getPets, getUpcomingSchedules } from '../lib/api';
import {
  describeDueDate,
  formatDate,
  formatGrams,
  getInventoryTone,
  getScheduleTypeLabel,
} from '../lib/formatting';
import type { HealthSchedule, InventoryForecast, Pet } from '../lib/types';

function Dashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [inventories, setInventories] = useState<InventoryForecast[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<HealthSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [nextPets, nextUpcomingSchedules] = await Promise.all([
        getPets(),
        getUpcomingSchedules(),
      ]);

      const inventoryBatches = await Promise.all(
        nextPets.map(async (pet) => {
          const items = await getInventoryByPet(pet.id);
          return items.map((item) => ({
            ...item,
            pet: { id: pet.id, name: pet.name, type: pet.type },
          }));
        }),
      );

      setPets(nextPets);
      setInventories(
        inventoryBatches
          .flat()
          .sort((left, right) => left.remainingDays - right.remainingDays),
      );
      setUpcomingSchedules(nextUpcomingSchedules);
    } catch {
      setError('Không thể tải số liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }

  const featuredInventory = inventories[0];
  const featuredSchedule = upcomingSchedules[0];
  const lowStockCount = inventories.filter((item) => item.remainingDays <= 7).length;

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-8 md:p-12">
      <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-2xl shadow-nature/20 group md:h-80">
        <img
          src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=1200&auto=format&fit=crop"
          alt="Dogs playing in nature"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="relative flex h-full max-w-3xl flex-col justify-center gap-5 px-10 text-white md:px-16">
          <div>
            <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
              Chào buổi sáng!
            </h2>
            <p className="text-lg font-medium leading-relaxed text-white/90 md:text-xl">
              Theo dõi kho thức ăn và lịch trình sắp tới trực tiếp từ dữ liệu thật
              thay vì placeholder.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-white/90">
            <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              {pets.length} thú cưng
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              {inventories.length} bản ghi kho
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              {upcomingSchedules.length} lịch trong 7 ngày tới
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl border border-orange-100/50 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-warm/10 blur-2xl transition-colors group-hover:bg-warm/20" />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              Cảnh báo khẩn cấp
            </h3>
            <p className="text-xl font-bold text-slate-800">
              {featuredInventory?.pet?.name
                ? `Thức ăn của ${featuredInventory.pet.name}`
                : 'Chưa có dữ liệu kho'}
            </p>
            <p className="mt-2 font-semibold text-slate-600">
              {featuredInventory
                ? `${formatGrams(featuredInventory.remainingWeightGrams)} • Còn ${featuredInventory.remainingDays} ngày`
                : loading
                  ? 'Đang tải dữ liệu tồn kho...'
                  : 'Tạo kho thức ăn để xem dự báo còn lại.'}
            </p>
          </div>
        </div>

        <div className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl border border-nature-light/50 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-nature/10 blur-2xl transition-colors group-hover:bg-nature/20" />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nature-light text-nature-dark">
            <CalendarClock size={24} />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              Sắp tới hạn
            </h3>
            <p className="text-xl font-bold text-slate-800">
              {featuredSchedule
                ? `${featuredSchedule.eventName} ${featuredSchedule.pet ? `(${featuredSchedule.pet.name})` : ''}`
                : 'Chưa có lịch sắp tới'}
            </p>
            <p className="mt-2 font-semibold text-nature-dark">
              {featuredSchedule
                ? `${describeDueDate(featuredSchedule.nextDueDate)} • ${formatDate(featuredSchedule.nextDueDate)}`
                : loading
                  ? 'Đang tải dữ liệu lịch...'
                  : 'Thêm lịch trình để theo dõi việc sắp tới hạn.'}
            </p>
          </div>
        </div>

        <div className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-3xl border border-blue-50 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=400&auto=format&fit=crop"
              className="h-full w-full object-cover opacity-10 grayscale transition-all duration-500 group-hover:opacity-20 group-hover:grayscale-0"
              alt="Blurred cat portrait"
            />
          </div>
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50/80 text-blue-600 backdrop-blur-sm">
            <Bone size={24} />
          </div>
          <div className="relative z-10">
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              Lịch Y tế
            </h3>
            <p className="text-xl font-bold text-slate-800">
              {featuredSchedule ? getScheduleTypeLabel(featuredSchedule.eventType) : 'Tổng quan chăm sóc'}
            </p>
            <p className="mt-2 font-semibold text-blue-600">
              {featuredSchedule
                ? `${upcomingSchedules.length} việc trong 7 ngày tới`
                : loading
                  ? 'Đang tổng hợp dữ liệu...'
                  : `${lowStockCount} kho cần theo dõi, ${pets.length} thú cưng đang quản lý`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-warm/10 p-3 text-warm-dark">
              <PawPrint size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Tồn kho cần chú ý
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Những bản ghi có số ngày còn lại thấp nhất được ưu tiên hiển thị.
              </p>
            </div>
          </div>

          {inventories.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center text-sm text-slate-500">
              Chưa có dữ liệu kho thức ăn để hiển thị.
            </div>
          ) : (
            <div className="space-y-4">
              {inventories.slice(0, 3).map((inventory) => (
                (() => {
                  const tone = getInventoryTone(inventory.remainingDays);
                  const toneClasses =
                    tone === 'critical'
                      ? 'text-red-500 bg-red-50'
                      : tone === 'warning'
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-nature-dark bg-nature-light';

                  return (
                    <article
                      key={inventory.id}
                      className="flex flex-col gap-4 rounded-[28px] border border-slate-100 bg-[#fffdfa] p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {inventory.pet?.name || 'Không rõ thú cưng'} • {inventory.foodName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Còn lại {formatGrams(inventory.remainingWeightGrams)} từ tổng{' '}
                          {formatGrams(inventory.totalWeightGrams)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${toneClasses}`}
                      >
                        Còn {inventory.remainingDays} ngày
                      </span>
                    </article>
                  );
                })()
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <CalendarClock size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Việc sắp tới hạn
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Lấy trực tiếp từ endpoint upcoming của backend.
              </p>
            </div>
          </div>

          {upcomingSchedules.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-100 bg-blue-50/40 px-6 py-12 text-center text-sm text-slate-500">
              Chưa có lịch trình nào trong 7 ngày tới.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.slice(0, 4).map((schedule) => (
                <article
                  key={schedule.id}
                  className="rounded-[28px] border border-slate-100 bg-[#fffdfa] p-5"
                >
                  <p className="text-lg font-bold text-slate-900">
                    {schedule.eventName}
                    {schedule.pet ? ` • ${schedule.pet.name}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getScheduleTypeLabel(schedule.eventType)} •{' '}
                    {formatDate(schedule.nextDueDate)}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-blue-600">
                    {describeDueDate(schedule.nextDueDate)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
