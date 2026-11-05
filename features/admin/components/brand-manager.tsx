"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminBrandItem } from "@/features/admin/repositories/brand.repository";
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
} from "@/features/admin/actions/catalog-admin.actions";

interface BrandManagerProps {
  brands: AdminBrandItem[];
}

export function BrandManager({ brands }: BrandManagerProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [showAddForm, setShowAddForm] = React.useState(false);

  // New Brand Form State
  const [newName, setNewName] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newLogo, setNewLogo] = React.useState("");
  const [newPosition, setNewPosition] = React.useState(0);

  // Editing State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editLogo, setEditLogo] = React.useState("");
  const [editPosition, setEditPosition] = React.useState(0);
  const [updating, setUpdating] = React.useState(false);

  const filteredBrands = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q),
    );
  }, [brands, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (newName.trim().length < 2) {
      toast.error("Brand name must be at least 2 characters.");
      return;
    }

    setCreating(true);
    const res = await createBrandAction({
      name: newName.trim(),
      slug: newSlug.trim() || undefined,
      logo: newLogo.trim() || undefined,
      position: Number(newPosition) || 0,
    });
    setCreating(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Brand created successfully.");
    setNewName("");
    setNewSlug("");
    setNewLogo("");
    setNewPosition(0);
    setShowAddForm(false);
    router.refresh();
  }

  async function handleToggleActive(brand: AdminBrandItem) {
    const res = await updateBrandAction({
      id: brand.id,
      isActive: !brand.isActive,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Brand ${!brand.isActive ? "activated" : "deactivated"}.`);
    router.refresh();
  }

  function startEdit(brand: AdminBrandItem) {
    setEditingId(brand.id);
    setEditName(brand.name);
    setEditLogo(brand.logo ?? "");
    setEditPosition(brand.position);
  }

  async function saveEdit(id: string) {
    setUpdating(true);
    const res = await updateBrandAction({
      id,
      name: editName.trim(),
      logo: editLogo.trim(),
      position: Number(editPosition) || 0,
    });
    setUpdating(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Brand updated.");
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This will affect all associated models.`)) {
      return;
    }

    const res = await deleteBrandAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Brand deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Brand Management</h1>
          <p className="text-sm text-slate-400">
            Create and organize smartphone and electronics brands dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands…"
              className="pl-9 bg-[#141519] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            {showAddForm ? "Cancel" : "Add Brand"}
          </Button>
        </div>
      </div>

      {/* Add Brand Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-white/10 bg-[#141519] p-5 shadow-lg space-y-4"
        >
          <h3 className="text-sm font-semibold text-white">Create New Mobile Brand</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Brand Name *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Apple, Samsung"
                required
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Custom Slug (optional)</label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="e.g. apple, samsung"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Logo Image URL</label>
              <Input
                value={newLogo}
                onChange={(e) => setNewLogo(e.target.value)}
                placeholder="https://.../apple-logo.png"
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Display Order</label>
              <Input
                type="number"
                value={newPosition}
                onChange={(e) => setNewPosition(Number(e.target.value))}
                min={0}
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
              Save Brand
            </Button>
          </div>
        </form>
      )}

      {/* Brands Table */}
      <div className="rounded-xl border border-white/10 bg-[#141519] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#08090b] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Brand</th>
                <th className="px-4 py-4">Slug</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Phone Models</th>
                <th className="px-4 py-4 text-center">Active Listings</th>
                <th className="px-4 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No brands found. Click "Add Brand" to create one.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const isEditing = editingId === brand.id;
                  return (
                    <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#0e0f12] border-white/20 text-white h-8 text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="size-7 rounded-lg object-contain bg-white/10 p-0.5"
                              />
                            ) : (
                              <div className="size-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {brand.name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-white">{brand.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">
                        {brand.slug}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(brand)}
                          className="cursor-pointer"
                          title="Click to toggle active status"
                        >
                          {brand.isActive ? (
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
                      <td className="px-4 py-4 text-center text-slate-300 font-medium">
                        {brand._count.phoneModels}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300 font-medium">
                        {brand._count.listings}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-400">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editPosition}
                            onChange={(e) => setEditPosition(Number(e.target.value))}
                            className="bg-[#0e0f12] border-white/20 text-white h-8 w-16 text-xs text-center mx-auto"
                          />
                        ) : (
                          brand.position
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(brand.id)}
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
                              onClick={() => startEdit(brand)}
                              className="size-8 p-0 text-slate-400 hover:text-white"
                              title="Edit Brand"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(brand.id, brand.name)}
                              className="size-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              title="Delete Brand"
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

