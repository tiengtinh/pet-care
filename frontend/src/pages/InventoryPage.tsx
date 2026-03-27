import { useEffect, useState } from 'react';
import {
  AlertCircle,
  DatabaseZap,
  PackagePlus,
  PencilLine,
  RefreshCw,
} from 'lucide-react';

import ModalPanel from '../components/ModalPanel';
import {
  createInventory,
  getErrorMessage,
  getInventoryByPet,
  getPets,
  updateInventory,
} from '../lib/api';
import {
  formatDateTime,
  formatGrams,
  formatNumber,
  getInventoryTone,
} from '../lib/formatting';
import type { InventoryForecast, Pet } from '../lib/types';

interface InventoryFormState {
  petId: string;
  foodName: string;
  totalWeightGrams: string;
  dailyPortionGrams: string;
}

const emptyFormState: InventoryFormState = {
  petId: '',
  foodName: '',
  totalWeightGrams: '',
  dailyPortionGrams: '',
};

function InventoryPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [inventories, setInventories] = useState<InventoryForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryForecast | null>(
    null,
  );
  const [form, setForm] = useState<InventoryFormState>(emptyFormState);

  useEffect(() => {
    void loadInventoryOverview();
  }, []);

  async function loadInventoryOverview() {
    setLoading(true);
    setError(null);

    try {
      const nextPets = await getPets();
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
    } catch (nextError) {
      setError(
        getErrorMessage(nextError, 'Không thể tải dữ liệu kho thức ăn.'),
      );
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingInventory(null);
    setForm(emptyFormState);
  }

  function openCreateModal() {
    setEditingInventory(null);
    setForm({
      ...emptyFormState,
      petId: pets[0]?.id ?? '',
    });
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(inventory: InventoryForecast) {
    setEditingInventory(inventory);
    setForm({
      petId: inventory.petId,
      foodName: inventory.foodName,
      totalWeightGrams: String(inventory.totalWeightGrams),
      dailyPortionGrams: String(inventory.dailyPortionGrams),
    });
    setError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingInventory) {
        await updateInventory(editingInventory.id, {
          foodName: form.foodName.trim(),
          totalWeightGrams: Number(form.totalWeightGrams),
          dailyPortionGrams: Number(form.dailyPortionGrams),
        });
      } else {
        await createInventory({
          petId: form.petId,
          foodName: form.foodName.trim(),
          totalWeightGrams: Number(form.totalWeightGrams),
          dailyPortionGrams: Number(form.dailyPortionGrams),
        });
      }

      setIsModalOpen(false);
      setEditingInventory(null);
      setForm(emptyFormState);
      await loadInventoryOverview();
    } catch (nextError) {
      setError(getErrorMessage(nextError, 'Không thể lưu kho thức ăn.'));
    } finally {
      setSaving(false);
    }
  }

  const lowStockCount = inventories.filter((item) => item.remainingDays <= 7).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <section className="relative overflow-hidden rounded-[36px] border border-nature-light/80 bg-white/80 p-8 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur-xl md:p-10">
        <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-nature/20 to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-nature-light px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-nature-dark">
              <DatabaseZap size={14} />
              Inventory Forecast
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Quản lý thức ăn và dự báo số ngày còn lại
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                Theo dõi lượng thức ăn còn lại và dự báo số ngày có thể dùng cho từng thú cưng.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void loadInventoryOverview()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <RefreshCw size={18} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={pets.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warm px-5 py-3 font-semibold text-white shadow-lg shadow-warm/30 transition hover:bg-warm-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PackagePlus size={18} />
              Thêm Kho
            </button>
          </div>
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
            Tổng kho
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">
            {inventories.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Mỗi bản ghi tương ứng một loại thức ăn cho một thú cưng.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Cần theo dõi
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">
            {lowStockCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Kho còn dưới 7 ngày sẽ được đẩy lên đầu bảng.
          </p>
        </article>

        <article className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Nguồn dữ liệu
          </p>
          <p className="mt-4 text-2xl font-black text-slate-900">
            {pets.length > 0 ? `${pets.length} thú cưng` : 'Chưa có thú cưng'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Tạo thú cưng trước khi thêm dữ liệu kho thức ăn.
          </p>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Bảng dự báo tồn kho
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Dùng nút <span className="font-semibold">Sửa</span> để cập nhật kho
              và reset forecasting về thời điểm hiện tại.
            </p>
          </div>
          {pets.length === 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              <AlertCircle size={14} />
              Cần tạo thú cưng trước
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center text-sm text-slate-500">
            Đang tải dữ liệu kho thức ăn...
          </div>
        ) : inventories.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 px-6 py-12 text-center text-sm text-slate-500">
            Chưa có dữ liệu kho. Nhấn <span className="font-semibold">Thêm Kho</span> để tạo bản ghi đầu tiên.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50/90">
                  <tr className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                    <th className="px-5 py-4">Thú cưng</th>
                    <th className="px-5 py-4">Thức ăn</th>
                    <th className="px-5 py-4">Còn lại</th>
                    <th className="px-5 py-4">Forecast</th>
                    <th className="px-5 py-4">Cập nhật</th>
                    <th className="px-5 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {inventories.map((inventory) => {
                    const tone = getInventoryTone(inventory.remainingDays);
                    const toneClasses =
                      tone === 'critical'
                        ? 'bg-red-50 text-red-600'
                        : tone === 'warning'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-nature-light text-nature-dark';

                    return (
                      <tr key={inventory.id} className="align-top">
                        <td className="px-5 py-5">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {inventory.pet?.name || 'Không rõ thú cưng'}
                            </p>
                            <p className="text-sm text-slate-500">
                              Khẩu phần {formatNumber(inventory.dailyPortionGrams)}g/ngày
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">
                              {inventory.foodName}
                            </p>
                            <p className="text-sm text-slate-500">
                              Tổng khối lượng {formatGrams(inventory.totalWeightGrams)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <p className="font-semibold text-slate-900">
                            {formatGrams(inventory.remainingWeightGrams)}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${toneClasses}`}
                          >
                            Còn {inventory.remainingDays} ngày
                          </span>
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-500">
                          {formatDateTime(inventory.lastUpdatedDate)}
                        </td>
                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditModal(inventory)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <PencilLine size={16} />
                            Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <ModalPanel
        open={isModalOpen}
        title={editingInventory ? 'Cập Nhật Kho' : 'Thêm Kho'}
        description={
          editingInventory
            ? 'Chỉnh sửa thông tin thức ăn. Khi lưu, thời gian cập nhật sẽ được reset để tính forecast mới.'
            : 'Tạo bản ghi kho thức ăn mới cho một thú cưng cụ thể.'
        }
        onClose={closeModal}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Thú cưng
              <select
                required
                value={form.petId}
                disabled={!!editingInventory}
                onChange={(event) =>
                  setForm((current) => ({ ...current, petId: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10 disabled:bg-slate-50"
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
              Tên thức ăn
              <input
                required
                value={form.foodName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    foodName: event.target.value,
                  }))
                }
                placeholder="Ví dụ: Royal Canin"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Tổng khối lượng (g)
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={form.totalWeightGrams}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    totalWeightGrams: event.target.value,
                  }))
                }
                placeholder="3000"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-warm focus:ring-4 focus:ring-warm/10"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Khẩu phần ăn hàng ngày (g)
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={form.dailyPortionGrams}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dailyPortionGrams: event.target.value,
                  }))
                }
                placeholder="150"
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

export default InventoryPage;
