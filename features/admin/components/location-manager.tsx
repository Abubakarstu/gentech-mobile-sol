"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Loader2, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CityWithAreas } from "@/features/admin/repositories/location.repository";
import {
  createCityAction,
  updateCityAction,
  deleteCityAction,
  createAreaAction,
  deleteAreaAction,
} from "../actions/location-admin.actions";

export function LocationManager({ cities }: { cities: CityWithAreas[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [expandedCityId, setExpandedCityId] = React.useState<string | null>(null);

  // New City Form State
  const [showAddCity, setShowAddCity] = React.useState(false);
  const [cityName, setCityName] = React.useState("");
  const [province, setProvince] = React.useState("Punjab");
  const [popular, setPopular] = React.useState(false);
  const [creatingCity, setCreatingCity] = React.useState(false);

  // New Area Form State
  const [areaCityId, setAreaCityId] = React.useState<string | null>(null);
  const [areaName, setAreaName] = React.useState("");
  const [creatingArea, setCreatingArea] = React.useState(false);

  const filteredCities = React.useMemo(() => {
    return cities.filter((c) => {
      const matchCity = c.name.toLowerCase().includes(search.toLowerCase());
      const matchArea = c.areas.some((a) => a.name.toLowerCase().includes(search.toLowerCase()));
      return matchCity || matchArea;
    });
  }, [cities, search]);

  async function handleCreateCity(e: React.FormEvent) {
    e.preventDefault();
    if (cityName.trim().length < 2) {
      toast.error("City name must be at least 2 characters.");
      return;
    }

    setCreatingCity(true);
    const res = await createCityAction({
      name: cityName.trim(),
      province: province.trim() || undefined,
      popular,
    });
    setCreatingCity(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("City created.");
    setCityName("");
    setShowAddCity(false);
    router.refresh();
  }

  async function handleToggleCityActive(city: CityWithAreas) {
    const res = await updateCityAction({
      id: city.id,
      isActive: !city.isActive,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`City ${!city.isActive ? "activated" : "deactivated"}.`);
    router.refresh();
  }

  async function handleDeleteCity(id: string, name: string) {
    if (!confirm(`Delete ${name} and all its associated areas?`)) return;

    const res = await deleteCityAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("City deleted.");
    router.refresh();
  }

  async function handleCreateArea(e: React.FormEvent) {
    e.preventDefault();
    if (!areaCityId || areaName.trim().length < 2) return;

    setCreatingArea(true);
    const res = await createAreaAction({
      name: areaName.trim(),
      cityId: areaCityId,
    });
    setCreatingArea(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success("Area added.");
    setAreaName("");
    setAreaCityId(null);
    router.refresh();
  }

  async function handleDeleteArea(id: string, name: string) {
    if (!confirm(`Delete area ${name}?`)) return;

    const res = await deleteAreaAction(id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Area deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Location Taxonomy</h1>
          <p className="text-sm text-slate-400">
            Manage cities, provinces, and neighbourhood areas for mobile classified listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities or areas…"
              className="pl-9 bg-[#141519] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            onClick={() => setShowAddCity(!showAddCity)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
          >
            <Plus className="size-4 mr-1.5" />
            {showAddCity ? "Cancel" : "Add City"}
          </Button>
        </div>
      </div>

      {/* Add City Form */}
      {showAddCity && (
        <form
          onSubmit={handleCreateCity}
          className="rounded-xl border border-white/10 bg-[#141519] p-5 shadow-lg space-y-4"
        >
          <h3 className="text-sm font-semibold text-white">Register New City</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">City Name *</label>
              <Input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Islamabad, Lahore, Karachi"
                required
                className="bg-[#0e0f12] border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Province / Region</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-9 rounded-md bg-[#0e0f12] border border-white/10 px-3 text-xs text-white"
              >
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-white/10 bg-[#0e0f12] text-emerald-500 focus:ring-0"
                />
                Show on Homepage as Popular City
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddCity(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creatingCity}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              {creatingCity ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Save City
            </Button>
          </div>
        </form>
      )}

      {/* Cities and Areas List */}
      <div className="rounded-xl border border-white/10 bg-[#141519] overflow-hidden divide-y divide-white/5">
        {filteredCities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No cities configured yet. Click &quot;Add City&quot; to register locations.
          </div>
        ) : (
          filteredCities.map((city) => {
            const isExpanded = expandedCityId === city.id;
            return (
              <div key={city.id} className="transition-colors">
                <div className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedCityId(isExpanded ? null : city.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>
                    <div className="size-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{city.name}</span>
                        {city.province && (
                          <span className="text-xs text-slate-400">({city.province})</span>
                        )}
                        {city.popular && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {city.areas.length} configured neighbourhoods / areas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleCityActive(city)}
                      className="cursor-pointer"
                      title="Toggle active status"
                    >
                      {city.isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-white/10 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAreaCityId(city.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Area
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCity(city.id, city.name)}
                      className="size-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      title="Delete City"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Inline Area Form if this city selected */}
                {areaCityId === city.id && (
                  <form
                    onSubmit={handleCreateArea}
                    className="mx-6 my-2 p-3 rounded-lg border border-white/10 bg-[#0e0f12] flex items-center gap-3"
                  >
                    <Input
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder={`New area for ${city.name} (e.g. DHA Phase 5, Blue Area, Gulberg)`}
                      className="h-8 text-xs bg-[#141519] border-white/10 text-white"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={creatingArea || areaName.trim().length < 2}
                      className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs shrink-0"
                    >
                      {creatingArea ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
                      Save Area
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAreaCityId(null)}
                      className="h-8 text-xs text-slate-400 hover:text-white shrink-0"
                    >
                      Cancel
                    </Button>
                  </form>
                )}

                {/* Expanded Areas list */}
                {isExpanded && (
                  <div className="bg-[#0e0f12] px-12 py-3 border-t border-white/5 space-y-2">
                    {city.areas.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        No sub-areas registered for {city.name}. Click &quot;Add Area&quot; above to create one.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {city.areas.map((area) => (
                          <div
                            key={area.id}
                            className="flex items-center justify-between rounded bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"
                          >
                            <span className="truncate">{area.name}</span>
                            <button
                              onClick={() => handleDeleteArea(area.id, area.name)}
                              className="text-slate-500 hover:text-rose-400 transition-colors ml-1.5"
                              title="Delete Area"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

