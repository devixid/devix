"use client";

import { useState, useTransition } from "react";
import { Coupon } from "@prisma/client";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/actions/admin/coupons";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

export function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons] = useState<Coupon[]>(initialCoupons);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState("");
  const [active, setActive] = useState(true);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setActive(true);
    setMaxUses("");
    setExpiresAt("");
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType as "PERCENTAGE" | "FIXED");
    setDiscountValue(Number(coupon.discountValue).toString());
    setActive(coupon.active);
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : "");
    setExpiresAt(
      coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : "",
    );
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("code", code);
    formData.append("discountType", discountType);
    formData.append("discountValue", discountValue);
    formData.append("active", active.toString());
    formData.append("maxUses", maxUses);
    formData.append("expiresAt", expiresAt);

    startTransition(async () => {
      try {
        if (editingCoupon) {
          const result = await updateCoupon(editingCoupon.code, formData);
          if (result.success) {
            setSuccess("Coupon updated successfully.");
            setIsModalOpen(false);
            window.location.reload();
          }
        } else {
          const result = await createCoupon(formData);
          if (result.success) {
            setSuccess("Coupon created successfully.");
            setIsModalOpen(false);
            window.location.reload();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handleDelete = (codeToDelete: string) => {
    if (!window.confirm(`Delete coupon ${codeToDelete}?`)) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await deleteCoupon(codeToDelete);
        if (result.success) {
          setSuccess("Coupon deleted successfully.");
          window.location.reload();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handleToggleActive = (coupon: Coupon) => {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("discountType", coupon.discountType);
    formData.append("discountValue", Number(coupon.discountValue).toString());
    formData.append("active", (!coupon.active).toString());
    formData.append("maxUses", coupon.maxUses ? coupon.maxUses.toString() : "");
    formData.append(
      "expiresAt",
      coupon.expiresAt ? coupon.expiresAt.toISOString() : "",
    );

    startTransition(async () => {
      try {
        const result = await updateCoupon(coupon.code, formData);
        if (result.success) {
          setSuccess(`Coupon ${coupon.code} active status updated.`);
          window.location.reload();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage local discount codes and promotion settings.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C8A96E] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-800/50 text-xs text-zinc-400 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Expires</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {coupons.map((coupon) => (
              <tr
                key={coupon.code}
                className="transition-colors hover:bg-zinc-800/50"
              >
                <td className="px-6 py-4 font-mono font-bold text-zinc-100">
                  {coupon.code}
                </td>
                <td className="px-6 py-4">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${Number(coupon.discountValue)}%`
                    : `$${Number(coupon.discountValue).toFixed(2)}`}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    disabled={isPending}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                      coupon.active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {coupon.useCount} / {coupon.maxUses ?? "∞"}
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(coupon)}
                      className="rounded border border-zinc-700 p-1 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.code)}
                      disabled={isPending}
                      className="rounded border border-red-900 p-1 text-red-400 transition-colors hover:border-red-700 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-zinc-500"
                >
                  No coupons found. Click "Create Coupon" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 w-full h-full bg-black/75 backdrop-blur-sm cursor-default border-none outline-none"
            onClick={() => !isPending && setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h2 className="font-display text-xl font-semibold text-zinc-100 mb-6">
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Coupon"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modal-code" className="text-xs font-semibold text-zinc-400 uppercase">
                  Code
                </label>
                <input
                  id="modal-code"
                  type="text"
                  required
                  placeholder="e.g. SAVE20"
                  disabled={!!editingCoupon || isPending}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="modal-type" className="text-xs font-semibold text-zinc-400 uppercase">
                    Type
                  </label>
                  <select
                    id="modal-type"
                    value={discountType}
                    disabled={isPending}
                    onChange={(e) =>
                      setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="modal-value" className="text-xs font-semibold text-zinc-400 uppercase">
                    Value
                  </label>
                  <input
                    id="modal-value"
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    placeholder="e.g. 20"
                    disabled={isPending}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="modal-max-uses" className="text-xs font-semibold text-zinc-400 uppercase">
                    Max Uses (Optional)
                  </label>
                  <input
                    id="modal-max-uses"
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    disabled={isPending}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="modal-expires" className="text-xs font-semibold text-zinc-400 uppercase">
                    Expires At (Optional)
                  </label>
                  <input
                    id="modal-expires"
                    type="datetime-local"
                    disabled={isPending}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="active"
                  disabled={isPending}
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-zinc-900 focus:ring-0 focus:ring-offset-0"
                />
                <label
                  htmlFor="active"
                  className="text-sm text-zinc-300 select-none cursor-pointer"
                >
                  Active and usable
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#C8A96E] hover:opacity-90 text-black px-4 py-2 text-sm font-semibold rounded transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
