import { useEffect, useState } from 'react';
import { CalendarClock, Clock3, Plus, Sparkles } from 'lucide-react';

import ModalPanel from '../components/ModalPanel';
import {
  createSchedule,
  getErrorMessage,
  getPets,
  getSchedulesByPet,
} from '../lib/api';
import {
  describeDueDate,
  formatDate,
  getPetTypeLabel,
  getScheduleTypeLabel,
  getTomorrowDateInputValue,
  SCHEDULE_TYPE_OPTIONS,
} from '../lib/formatting';
import type { HealthSchedule, Pet } from '../lib/types';

interface ScheduleFormState {
  petId: string;
  eventType: string;
  nextDueDate: string;
}

const initialScheduleForm: ScheduleFormState = {
  petId: '',
  eventType: 'water_change',
  nextDueDate: getTomorrowDateInputValue(),
};

function SchedulesPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [schedules, setSchedules] = useState<HealthSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ScheduleFormState>(initialScheduleForm);

  useEffect(() => {
    void loadSchedulesOverview();
  }, []);

  async function loadSchedulesOverview() {
    setLoading(true);
    setError(null);

    try {
      const nextPets = await getPets();
      const scheduleBatches = await Promise.all(
        nextPets.map(async (pet) => {
          const items = await getSchedulesByPet(pet.id);
          return items.map((item) => ({
            ...item,
            pet: { id: pet.id, name: pet.name, type: pet.type },
          }));
        }),
      );

      setPets(nextPets);
      setSchedules(
        scheduleBatches
          .flat()
          .sort(
            (left, right) =>
              new Date(left.nextDueDate).getTime() -
              new Date(right.nextDueDate).getTime(),
          ),
      );
    } catch (nextError) {
      setError(
        getErrorMessage(nextError, 'Không thể tải dữ liệu lịch trình.'),
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setForm({
      petId: pets[0]?.id ?? '',
      eventType: 'water_change',
      nextDueDate: getTomorrowDateInputValue(),
    });
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setForm(initialScheduleForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createSchedule({
        petId: form.petId,
        eventType: form.eventType,
        eventName: getScheduleTypeLabel(form.eventType),
        nextDueDate: form.nextDueDate,
      });

      setIsModalOpen(false);
      setForm(initialScheduleForm);
      await loadSchedulesOverview();
    } catch (nextError) {
      setError(getErrorMessage(nextError, 'Không thể lưu lịch trình.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <section className="relative overflow-hidden rounded-[36px] border border-blue-100/80 bg-white/80 p-8 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur-xl md:p-10">
        <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-blue-100/60 to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
              <CalendarClock size={14} />
              Upcoming Care
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Quản lý lịch trình chăm sóc và việc sắp tới hạn
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                Tạo sự kiện chăm sóc cho từng thú cưng để dashboard hiển thị
                các việc cần theo dõi trong những ngày tới.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={pets.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warm px-5 py-3 font-semibold text-white shadow-lg shadow-warm/30 transition hover:bg-warm-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Thêm Lịch
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Tổng sự kiện
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">
            {schedules.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Các lịch được gom từ toàn bộ thú cưng hiện có.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Sắp tới nhất
          </p>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {schedules[0] ? describeDueDate(schedules[0].nextDueDate) : 'Chưa có lịch'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Dashboard sẽ ưu tiên hiển thị các lịch đến gần nhất.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Trạng thái
          </p>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {pets.length > 0 ? `${pets.length} thú cưng` : 'Chưa có thú cưng'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tạo thú cưng trước để có thể thêm lịch trình.
          </p>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Danh sách Lịch Trình
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Các sự kiện trong 7 ngày tới sẽ xuất hiện trên dashboard ở mục <span className="font-semibold">Sắp tới hạn</span>.
          </p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-dashed border-blue-100 bg-blue-50/40 px-6 py-12 text-center text-sm text-slate-500">
            Đang tải dữ liệu lịch trình...
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-blue-100 bg-blue-50/40 px-6 py-12 text-center text-sm text-slate-500">
            Chưa có lịch trình nào. Nhấn <span className="font-semibold">Thêm Lịch</span> để tạo sự kiện đầu tiên.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {schedules.map((schedule) => (
              <article
                key={schedule.id}
                className="rounded-[28px] border border-slate-100 bg-[#fffdfa] p-6 shadow-[0_12px_35px_rgba(148,163,184,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {getScheduleTypeLabel(schedule.eventType)}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900">
                        {schedule.eventName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {schedule.pet?.name || 'Không rõ thú cưng'} •{' '}
                        {schedule.pet?.type
                          ? getPetTypeLabel(schedule.pet.type)
                          : 'Không rõ loại'}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <Clock3 size={22} />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Ngày hẹn
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {formatDate(schedule.nextDueDate)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Trạng thái
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {describeDueDate(schedule.nextDueDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles size={14} className="text-blue-600" />
                  Mục này sẽ xuất hiện trên dashboard nếu nằm trong 7 ngày tới.
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ModalPanel
        open={isModalOpen}
        title="Thêm Lịch"
        description="Tạo lịch mới cho thú cưng. Các sự kiện trong 7 ngày tới sẽ xuất hiện ở dashboard."
        onClose={closeModal}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Thú cưng
              <select
                required
                value={form.petId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, petId: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              >
                <option value="" disabled>
                  Chọn thú cưng
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Loại sự kiện
              <select
                value={form.eventType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    eventType: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              >
                {SCHEDULE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Ngày hẹn
              <input
                required
                type="date"
                value={form.nextDueDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nextDueDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-warm px-5 py-3 font-semibold text-white shadow-lg shadow-warm/25 transition hover:bg-warm-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </ModalPanel>
    </div>
  );
}

export default SchedulesPage;
