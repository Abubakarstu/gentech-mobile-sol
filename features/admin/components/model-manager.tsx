"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Filter, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PhoneModelWithBrand } from "@/features/phone-intelligence/repositories/phone-model.repository";
import type { Brand } from "@/lib/generated/prisma/client";
import {
  createModelAction,
  updateModelAction,
  deleteModelAction,
} from "@/features/admin/actions/catalog-admin.actions";

interface ModelManagerProps {
  models: PhoneModelWithBrand[];
  brands: Brand[];
}

export function ModelManager({ models, brands }: ModelManagerProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState<string>("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [creating, setCreating] = React.useState(false);

  // New Model Form State
  const [name, setName] = React.useState("");
  const [brandId, setBrandId] = React.useState(brands[0]?.id ?? "");
  const [modelNumber, setModelNumber] = React.useState("");
  const [launchPrice, setLaunchPrice] = React.useState<number | undefined>();
  const [displaySize, setDisplaySize] = React.useState("");
  const [processor, setProcessor] = React.useState("");
  const [ramOptionsStr, setRamOptionsStr] = React.useState("6GB, 8GB, 12GB");
  const [storageOptionsStr, setStorageOptionsStr] = React.useState("128GB, 256GB, 512GB");
  const [batteryCapacity, setBatteryCapacity] = React.useState("");
  const [mainCamera, setMainCamera] = React.useState("");
  const [colorsStr, setColorsStr] = React.useState("Black, Silver, Blue");
  const [imageUrl, setImageUrl] = React.useState("");

  // Edit Model State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPrice, setEditPrice] = React.useState<number | undefined>();
  const [updating, setUpdating] = React.useState(false);

  const filteredModels = React.useMemo(() => {
    return models.filter((m) => {
      const matchesSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.modelNumber && m.modelNumber.toLowerCase().includes(search.toLowerCase()));

      const matchesBrand = !selectedBrand || m.brandId === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [models, search, selectedBrand]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Model name must be at least 2 characters.");
      return;
    }
    if (!brandId) {
      toast.error("Please select a brand.");
      return;
    }

    setCreating(true);
    const ramOptions = ramOptionsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const storageOptions = storageOptionsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(",").map((s) => s.trim()).filter(Boolean);

    const res = await createModelAction({
      name: name.trim(),
      brandId,
      modelNumber: modelNumber.trim() || undefined,
      launchPrice: launchPrice ? Number(launchPrice) : undefined,
      displaySize: displaySize.trim() || undefined,
      processor: processor.trim() || undefined,
      ramOptions,
      storageOptions,
      batteryCapacity: batteryCapacity.trim() || undefined,
      mainCamera: mainCamera.trim() || undefined,
      colors,
      imageUrl: imageUrl.trim() || undefined,
    });
    setCreating(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Phone model created.");
    setName("");
    setModelNumber("");
    setLaunchPrice(undefined);
    setDisplaySize("");
    setProcessor("");
    setBatteryCapacity("");
    setMainCamera("");
    setImageUrl("");
    setShowAddForm(false);
    router.refresh();
  }

  async function handleToggleActive(model: PhoneModelWithBrand) {
    const res = await updateModelAction({
      id: model.id,
      isActive: !model.isActive,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Model ${!model.isActive ? "activated" : "deactivated"}.`);
    router.refresh();
  }

  function startEdit(model: PhoneModelWithBrand) {
    setEditingId(model.id);
    setEditName(model.name);
    setEditPrice(model.launchPrice ? Number(model.launchPrice) : undefined);
  }

  async function saveEdit(id: string) {
    setUpdating(true);
    const res = await updateModelAction({
      id,
      name: editName.trim(),
      launchPrice: editPrice ? Number(editPrice) : null,
    });
    setUpdating(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Phone model updated.");
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const res = await deleteModelAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Phone model deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Phone Model Catalog</h1>
          <p className="text-sm text-slate-400">
            Define dynamic specifications, RAM variants, storage options, and colors.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models…"
              className="pl-9 bg-[#141519] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="size-4 text-slate-400" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-9 rounded-md bg-[#141519] border border-white/10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="">All Brands ({models.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            {showAddForm ? "Cancel" : "Add Model"}
          </Button>
        </div>
      </div>

      {/* Add Model Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-white/10 bg-[#141519] p-6 shadow-lg space-y-5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white">Create New Phone Model & Specifications</h3>
            <span className="text-xs text-slate-400">Values populate dynamic marketplace filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Brand *</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-9 rounded-md bg-[#0e0f12] border border-white/10 px-3 text-xs text-white"
                required
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Model Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 16 Pro Max, Galaxy S25 Ultra"
                required
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Model Number (optional)</label>
              <Input
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. A3296, SM-S938B"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Launch Price (PKR)</label>
              <Input
                type="number"
                value={launchPrice ?? ""}
                onChange={(e) => setLaunchPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 450000"
                min={0}
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Display Size</label>
              <Input
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value)}
                placeholder="e.g. 6.9 inches OLED 120Hz"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Processor (Chipset)</label>
              <Input
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="e.g. Apple A18 Pro, Snapdragon 8 Elite"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Battery Capacity</label>
              <Input
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(e.target.value)}
                placeholder="e.g. 4685mAh, 45W"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                RAM Variants (comma separated)
              </label>
              <Input
                value={ramOptionsStr}
                onChange={(e) => setRamOptionsStr(e.target.value)}
                placeholder="6GB, 8GB, 12GB, 16GB"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Storage Variants (comma separated)
              </label>
              <Input
                value={storageOptionsStr}
                onChange={(e) => setStorageOptionsStr(e.target.value)}
                placeholder="128GB, 256GB, 512GB, 1TB"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                Available Colors (comma separated)
              </label>
              <Input
                value={colorsStr}
                onChange={(e) => setColorsStr(e.target.value)}
                placeholder="Desert Titanium, Black, White"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Main Camera Specs</label>
              <Input
                value={mainCamera}
                onChange={(e) => setMainCamera(e.target.value)}
                placeholder="e.g. 48MP Wide + 48MP Ultra-Wide + 12MP 5x Telephoto"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Official Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://.../iphone16promax.png"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              {creating ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Save Phone Model
            </Button>
          </div>
        </form>
      )}

      {/* Models Table */}
      <div className="rounded-xl border border-white/10 bg-[#141519] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#08090b] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Phone Model</th>
                <th className="px-4 py-4">Brand</th>
                <th className="px-4 py-4">Storage Variants</th>
                <th className="px-4 py-4">RAM Variants</th>
                <th className="px-4 py-4">Specs Summary</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No phone models found matching the criteria. Click "Add Model" to register one.
                  </td>
                </tr>
              ) : (
                filteredModels.map((model) => {
                  const isEditing = editingId === model.id;
                  return (
                    <tr key={model.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-[#0e0f12] border-white/20 text-white h-8 text-xs"
                            />
                            <Input
                              type="number"
                              value={editPrice ?? ""}
                              onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Launch Price PKR"
                              className="bg-[#0e0f12] border-white/20 text-white h-7 text-[11px]"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {model.imageUrl ? (
                              <img
                                src={model.imageUrl}
                                alt={model.name}
                                className="size-8 rounded object-contain bg-white/10 p-0.5"
                              />
                            ) : (
                              <div className="size-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                📱
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white">{model.name}</div>
                              {model.launchPrice ? (
                                <div className="text-[11px] text-slate-400">
                                  Launch: PKR {Number(model.launchPrice).toLocaleString()}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="border-white/10 text-slate-300">
                          {model.brand.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {model.storageOptions.length > 0 ? (
                            model.storageOptions.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {model.ramOptions.length > 0 ? (
                            model.ramOptions.map((r) => (
                              <span
                                key={r}
                                className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 max-w-[220px] truncate">
                        {[model.displaySize, model.processor, model.batteryCapacity]
                          .filter(Boolean)
                          .join(" • ") || "No specs entered"}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(model)}
                          className="cursor-pointer"
                          title="Click to toggle active status"
                        >
                          {model.isActive ? (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-400 border-white/10 text-[11px]">
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(model.id)}
                              disabled={updating}
                              className="size-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                              className="size-8 p-0 text-slate-400 hover:text-white"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(model)}
                              className="size-8 p-0 text-slate-400 hover:text-white"
                              title="Edit Model"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(model.id, model.name)}
                              className="size-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              title="Delete Model"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

