"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CountryWithCities } from "@/features/admin/repositories/location.repository";
import {
  createCountryAction,
  updateCountryAction,
  createCityAction,
  updateCityAction,
  deleteCityAction,
  createAreaAction,
  updateAreaAction,
  deleteAreaAction,
} from "../actions/location-admin.actions";

export function LocationManager({ countries }: { countries: CountryWithCities[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [expandedCityId, setExpandedCityId] = React.useState<string | null>(null);
  const [showCountryForm, setShowCountryForm] = React.useState(false);
  const [showCityForm, setShowCityForm] = React.useState(false);
  const [countryName, setCountryName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");
  const [editingCountry, setEditingCountry] = React.useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);
  const [cityName, setCityName] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [popular, setPopular] = React.useState(false);
  const [editingCity, setEditingCity] = React.useState<{
    id: string;
    name: string;
    province: string;
  } | null>(null);
  const [areaCityId, setAreaCityId] = React.useState<string | null>(null);
  const [areaName, setAreaName] = React.useState("");
  const [editingArea, setEditingArea] = React.useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = React.useState(false);

  const query = search.trim().toLowerCase();
  const visibleCountries = countries
    .map((country) => {
      const countryMatches = country.name.toLowerCase().includes(query);
      return {
        ...country,
        cities:
          countryMatches || !query
            ? country.cities
            : country.cities.filter(
                (city) =>
                  city.name.toLowerCase().includes(query) ||
                  city.areas.some((area) => area.name.toLowerCase().includes(query)),
              ),
      };
    })
    .filter(
      (country) =>
        !query || country.name.toLowerCase().includes(query) || country.cities.length > 0,
    );
  const cityCount = countries.reduce((total, country) => total + country.cities.length, 0);
  const areaCount = countries.reduce(
    (total, country) =>
      total + country.cities.reduce((cityTotal, city) => cityTotal + city.areas.length, 0),
    0,
  );

  async function runAction(
    action: () => Promise<{ ok: boolean; error?: string }>,
    success: string,
  ) {
    setPending(true);
    const result = await action();
    setPending(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not update locations.");
      return false;
    }
    toast.success(success);
    router.refresh();
    return true;
  }

  async function handleCreateCountry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await runAction(
        () => createCountryAction({ name: countryName, code: countryCode }),
        "Country created.",
      )
    ) {
      setCountryName("");
      setCountryCode("");
      setShowCountryForm(false);
    }
  }

  async function handleCreateCity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await runAction(
        () =>
          createCityAction({
            name: cityName,
            countryId: cityCountryId,
            province: province || undefined,
            popular,
          }),
        "City created.",
      )
    ) {
      setCityName("");
      setProvince("");
      setPopular(false);
      setShowCityForm(false);
    }
  }

  async function handleCreateArea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!areaCityId) return;
    if (
      await runAction(
        () => createAreaAction({ name: areaName, cityId: areaCityId }),
        "Area created.",
      )
    ) {
      setAreaName("");
      setAreaCityId(null);
    }
  }

  async function handleToggleCountry(country: CountryWithCities) {
    await runAction(
      () => updateCountryAction({ id: country.id, isActive: !country.isActive }),
      `Country ${country.isActive ? "deactivated" : "activated"}.`,
    );
  }

  async function handleSaveCountry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCountry) return;
    if (
      await runAction(
        () =>
          updateCountryAction({
            id: editingCountry.id,
            name: editingCountry.name,
            code: editingCountry.code,
          }),
        "Country updated.",
      )
    ) {
      setEditingCountry(null);
    }
  }

  async function handleCreateArea(e: React.FormEvent) {
    e.preventDefault();
    if (!areaCityId) {
      toast.error("Choose a city before adding an area.");
      return;
    }
    if (areaName.trim().length < 2) {
      toast.error("Area name must be at least 2 characters.");
      return;
    }

  async function handleSaveCity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCity) return;
    if (
      await runAction(
        () =>
          updateCityAction({
            id: editingCity.id,
            name: editingCity.name,
            province: editingCity.province || null,
          }),
        "City updated.",
      )
    ) {
      setEditingCity(null);
    }
  }

  async function handleToggleArea(area: CountryWithCities["cities"][number]["areas"][number]) {
    await runAction(
      () => updateAreaAction({ id: area.id, isActive: !area.isActive }),
      `Area ${area.isActive ? "deactivated" : "activated"}.`,
    );
  }

  async function handleSaveArea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingArea) return;
    if (
      await runAction(
        () => updateAreaAction({ id: editingArea.id, name: editingArea.name }),
        "Area updated.",
      )
    ) {
      setEditingArea(null);
    }
  }

  async function handleDeleteCity(id: string, name: string) {
    if (
      !window.confirm(
        `Delete ${name} and its areas? Existing listing location text will be preserved.`,
      )
    )
      return;
    await runAction(() => deleteCityAction(id), "City deleted.");
  }

  async function handleDeleteArea(id: string, name: string) {
    if (!window.confirm(`Delete area ${name}? Existing listing location text will be preserved.`))
      return;
    await runAction(() => deleteAreaAction(id), "Area deleted.");
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-300 uppercase">
            Marketplace catalog
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Location taxonomy
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage cities, provinces, and neighbourhood areas for mobile classified listings.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[minmax(12rem,16rem)_auto]">
          <div className="relative min-w-0">
            <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities or areas…"
              aria-label="Search cities or areas"
              className="border-white/10 bg-[#141519] pl-9 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            onClick={() => setShowAddCity(!showAddCity)}
            className="min-h-10 bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            <Plus className="mr-1.5 size-4" />
            {showAddCity ? "Cancel" : "Add City"}
          </Button>
        </div>
      </header>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.07] bg-[#141519] px-4 py-3 text-xs"
        aria-live="polite"
      >
        <span className="font-semibold text-slate-100">{cities.length.toLocaleString()}</span>
        <span className="text-slate-500">cities</span>
        <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden="true" />
        <span className="font-semibold text-slate-100">
          {cities.reduce((total, city) => total + city.areas.length, 0).toLocaleString()}
        </span>
        <span className="text-slate-500">areas</span>
        <span className="ml-auto text-slate-500">Showing {filteredCities.length} matching</span>
      </div>

      {showCountryForm ? (
        <form
          onSubmit={handleCreateCountry}
          className="grid gap-3 rounded-xl border border-white/10 bg-[#141519] p-4 sm:grid-cols-[1fr_10rem_auto]"
        >
          <Input
            value={countryName}
            onChange={(event) => setCountryName(event.target.value)}
            placeholder="Country name"
            required
            minLength={2}
            maxLength={80}
            aria-label="Country name"
            className="border-white/10 bg-[#0e0f12] text-white"
          />
          <Input
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
            placeholder="ISO code (PK)"
            required
            minLength={2}
            maxLength={3}
            aria-label="Country code"
            className="border-white/10 bg-[#0e0f12] text-white"
          />
          <Button
            type="submit"
            disabled={pending || countryName.trim().length < 2 || countryCode.trim().length < 2}
            className="bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save country
          </Button>
        </form>
      ) : null}

      {showCityForm ? (
        <form
          onSubmit={handleCreateCity}
          className="space-y-4 rounded-xl border border-white/10 bg-[#141519] p-5 shadow-lg"
        >
          <h3 className="text-sm font-semibold text-white">Register New City</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="city-create-name"
                className="mb-1 block text-xs font-medium text-slate-400"
              >
                City Name *
              </label>
              <Input
                id="city-create-name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city name"
                required
                className="border-white/10 bg-[#0e0f12] text-white"
              />
            </div>
            <div>
              <label
                htmlFor="city-create-region"
                className="mb-1 block text-xs font-medium text-slate-400"
              >
                Province / Region
              </label>
              <Input
                id="city-create-region"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Add a province or region"
                maxLength={100}
                className="border-white/10 bg-[#0e0f12] text-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
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
              className="bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-600"
            >
              {creatingCity ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              Save City
            </Button>
          </div>
        </form>
      ) : null}

      {/* Cities and Areas List */}
      <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-[#141519]">
        {filteredCities.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No cities configured yet. Click &quot;Add City&quot; to register locations.
          </div>
        ) : (
          filteredCities.map((city) => {
            const isExpanded = expandedCityId === city.id;
            return (
              <div key={city.id} className="transition-colors">
                <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedCityId(isExpanded ? null : city.id)}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${city.name} areas`}
                      aria-expanded={isExpanded}
                      aria-controls={`city-areas-${city.id}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>
                    <div className="flex size-8 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-white">{city.name}</span>
                        {city.province && (
                          <span className="text-xs text-slate-400">({city.province})</span>
                        )}
                        {city.popular && (
                          <Badge className="border-amber-500/30 bg-amber-500/20 text-[10px] text-amber-300">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {city.areas.length} configured neighbourhoods / areas
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleCityActive(city)}
                      className="cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                      title={`${city.isActive ? "Deactivate" : "Activate"} ${city.name}`}
                      aria-label={`${city.isActive ? "Deactivate" : "Activate"} ${city.name}`}
                      aria-pressed={city.isActive}
                    >
                      {city.isActive ? (
                        <Badge className="border-emerald-500/30 bg-emerald-500/20 text-xs text-emerald-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="border-white/10 bg-slate-800 text-xs text-slate-400">
                          Inactive
                        </Badge>
                      )}
                    </button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAreaCityId(city.id)}
                      className="text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Area
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCity(city.id, city.name)}
                      className="size-9 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      title={`Delete ${city.name}`}
                      aria-label={`Delete ${city.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Inline Area Form if this city selected */}
                {areaCityId === city.id && (
                  <form
                    onSubmit={handleCreateArea}
                    className="mx-3 my-2 flex flex-col gap-2 rounded-lg border border-white/10 bg-[#0e0f12] p-3 sm:mx-6 sm:flex-row sm:items-center"
                  >
                    <Input
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      aria-label={`New area name for ${city.name}`}
                      placeholder={`New area in ${city.name}`}
                      className="h-10 border-white/10 bg-[#141519] text-xs text-white sm:h-8"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={creatingArea || areaName.trim().length < 2}
                      className="h-10 shrink-0 bg-emerald-400 text-xs font-semibold text-slate-950 hover:bg-emerald-300 sm:h-8"
                    >
                      {creatingArea ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}
                      Save Area
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setAreaCityId(null)}
                      className="h-10 shrink-0 text-xs text-slate-400 hover:text-white sm:h-8"
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                      <MapPin className="size-4" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-white">
                        {country.name}{" "}
                        <span className="text-xs font-normal text-slate-500">{country.code}</span>
                      </h2>
                      <p className="text-xs text-slate-500">{country.cities.length} cities</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {editingCountry?.id !== country.id ? (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Edit ${country.name}`}
                      disabled={pending}
                      onClick={() =>
                        setEditingCountry({
                          id: country.id,
                          name: country.name,
                          code: country.code,
                        })
                      }
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleToggleCountry(country)}
                    disabled={pending || editingCountry?.id === country.id}
                    aria-pressed={country.isActive}
                    className="rounded-full focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  >
                    <Badge
                      className={
                        country.isActive
                          ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-slate-800 text-slate-400"
                      }
                    >
                      {country.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </div>
              </header>

                {/* Expanded Areas list */}
                <div
                  id={`city-areas-${city.id}`}
                  hidden={!isExpanded}
                  className="space-y-2 border-t border-white/5 bg-[#0e0f12] px-5 py-3 sm:px-12"
                >
                  {city.areas.length === 0 ? (
                    <p className="py-2 text-xs text-slate-500 italic">
                      No sub-areas registered for {city.name}. Click &quot;Add Area&quot; above to
                      create one.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {city.areas.map((area) => (
                        <div
                          key={area.id}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300"
                        >
                          <span className="truncate">{area.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteArea(area.id, area.name)}
                            className="ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-rose-400/10 hover:text-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                            title={`Delete ${area.name}`}
                            aria-label={`Delete ${area.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
