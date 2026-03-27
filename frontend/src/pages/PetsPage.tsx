import { useEffect, useState } from 'react';
import { HeartHandshake, PawPrint, Plus, Scale, Sparkles } from 'lucide-react';

import ModalPanel from '../components/ModalPanel';
import { createPet, getErrorMessage, getPets } from '../lib/api';
import {
  formatDate,
  formatNumber,
  getPetTypeLabel,
  PET_TYPE_OPTIONS,
} from '../lib/formatting';
import type { Pet } from '../lib/types';

interface PetFormState {
  name: string;
  type: string;
  breed: string;
  weight: string;
  dob: string;
}

const initialFormState: PetFormState = {
  name: '',
  type: 'dog',
  breed: '',
  weight: '',
  dob: '',
};

function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<PetFormState>(initialFormState);

  useEffect(() => {
    void loadPets();
  }, []);

  async function loadPets() {
    setLoading(true);
    setError(null);

    try {
      const nextPets = await getPets();
      setPets(nextPets);
    } catch (nextError) {
      setError(
        getErrorMessage(nextError, 'Không thể tải danh sách thú cưng.'),
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setForm(initialFormState);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setForm(initialFormState);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createPet({
        name: form.name.trim(),
        type: form.type,
        breed: form.breed.trim() || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        dob: form.dob || undefined,
      });

      setIsModalOpen(false);
      setForm(initialFormState);
      await loadPets();
    } catch (nextError) {
      setError(getErrorMessage(nextError, 'Không thể tạo thú cưng.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <section className="relative overflow-hidden rounded-[36px] border border-orange-100/60 bg-white/75 p-8 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur-xl md:p-10">
        <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-warm/20 to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-warm/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-warm-dark">
              <HeartHandshake size={14} />
              Pets Registry
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Quản lý hồ sơ thú cưng của bạn
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                Tạo thú cưng trực tiếp từ giao diện, theo dõi loại vật nuôi và
                thông tin cơ bản để dùng tiếp cho kho thức ăn và lịch trình.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warm px-5 py-3 font-semibold text-white shadow-lg shadow-warm/30 transition hover:bg-warm-dark"
          >
            <Plus size={18} />
            Thêm Thú Cưng
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
            Tổng hồ sơ
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">{pets.length}</p>
          <p className="mt-2 text-sm text-slate-500">
            Sẵn sàng dùng trong các luồng quản lý chăm sóc.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Loại phổ biến
          </p>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {pets[0] ? getPetTypeLabel(pets[0].type) : 'Chưa có dữ liệu'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Danh sách được sắp theo thời gian tạo mới nhất.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Trạng thái
          </p>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {loading ? 'Đang đồng bộ...' : 'Hoạt động bình thường'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Form tạo và danh sách hiển thị đã thay thế placeholder.
          </p>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Danh sách Thú Cưng
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Thông tin này được tái sử dụng trực tiếp tại trang kho thức ăn và
              lịch trình.
            </p>
          </div>
          <div className="hidden rounded-full bg-nature-light px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-nature-dark md:inline-flex">
            Live data
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center text-sm text-slate-500">
            Đang tải danh sách thú cưng...
          </div>
        ) : pets.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center text-sm text-slate-500">
            Chưa có thú cưng nào. Nhấn <span className="font-semibold">Thêm Thú Cưng</span> để bắt đầu.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <article
                key={pet.id}
                className="rounded-[28px] border border-orange-100/70 bg-[#fffdfa] p-6 shadow-[0_12px_35px_rgba(148,163,184,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full bg-warm/10 px-3 py-1 text-xs font-bold text-warm-dark">
                      {getPetTypeLabel(pet.type)}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Tạo ngày {formatDate(pet.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-nature-light p-3 text-nature-dark">
                    <PawPrint size={22} />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Giống loài
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {pet.breed || 'Chưa khai báo'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Cân nặng
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Scale size={14} className="text-slate-400" />
                      {pet.weight ? `${formatNumber(pet.weight)} kg` : 'Chưa khai báo'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles size={14} className="text-warm-dark" />
                  Hồ sơ này đã sẵn sàng để chọn ở các màn hình tiếp theo.
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ModalPanel
        open={isModalOpen}
        title="Thêm Thú Cưng"
        description="Nhập thông tin cơ bản để sử dụng thú cưng này trong kho thức ăn và lịch trình."
        onClose={closeModal}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Tên thú cưng
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ví dụ: Chó Corgi"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Loại
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              >
                {PET_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Giống loài
              <input
                value={form.breed}
                onChange={(event) =>
                  setForm((current) => ({ ...current, breed: event.target.value }))
                }
                placeholder="Ví dụ: Pembroke Welsh Corgi"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Cân nặng (kg)
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={(event) =>
                  setForm((current) => ({ ...current, weight: event.target.value }))
                }
                placeholder="12"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Ngày sinh
              <input
                type="date"
                value={form.dob}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dob: event.target.value }))
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

export default PetsPage;
