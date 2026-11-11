"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { LISTING_CONDITION_LABELS, WARRANTY_TYPE, PTA_STATUS, CPID_STATUS } from "@/lib/constants";
import type {
  BrandItem,
  CategoryItem,
  ListingFilters,
  ListingFilterOptions,
} from "@/types/marketplace";
import type { LocationTree } from "@/features/locations/services/location.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

interface Props {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: ListingFilters;
  locations: LocationTree;
  filterOptions: ListingFilterOptions;
  onApply?: () => void;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function PriceRangeFilter({
  min,
  max,
  onApply,
}: {
  min?: number;
  max?: number;
  onApply?: () => void;
}) {
  const router = useRouter();
  const buildHref = useListingHref();
  const [minPrice, setMinPrice] = React.useState(min?.toString() ?? "");
  const [maxPrice, setMaxPrice] = React.useState(max?.toString() ?? "");

  function applyPrice(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildHref({ minPrice: minPrice || null, maxPrice: maxPrice || null }));
    onApply?.();
  }

  return (
    <form onSubmit={applyPrice} className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="grid gap-1">
          <Label htmlFor="minPrice" className="text-muted-foreground text-xs">
            Min
          </Label>
          <Input
            id="minPrice"
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="maxPrice" className="text-muted-foreground text-xs">
            Max
          </Label>
          <Input
            id="maxPrice"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))}
            placeholder="Any"
            className="h-9"
          />
        </div>
      </div>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Apply price
      </Button>
    </form>
  );
}

function BatteryHealthFilter({
  value,
  onApply,
}: {
  value?: number;
  onApply?: () => void;
}) {
  const router = useRouter();
  const buildHref = useListingHref();
  const [batteryHealthMin, setBatteryHealthMin] = React.useState(value?.toString() ?? "");

  function applyBatteryHealth() {
    router.push(buildHref({ batteryHealthMin: batteryHealthMin || null }));
    onApply?.();
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        inputMode="numeric"
        value={batteryHealthMin}
        onChange={(event) => setBatteryHealthMin(event.target.value.replace(/\D/g, "").slice(0, 3))}
        placeholder="Min %"
        aria-label="Minimum battery health"
        className="h-9"
      />
      <Button type="button" variant="outline" size="sm" onClick={applyBatteryHealth}>
        Apply
      </Button>
    </div>
  );
}

export function MarketplaceFilters({
  categories,
  brands,
  filters,
  locations,
  filterOptions,
  onApply,
}: Props) {
  const router = useRouter();
  const buildHref = useListingHref();

  const conditionEntries = Object.entries(LISTING_CONDITION_LABELS);

  return (
    <div className="text-sm">
      <FilterGroup title="Category">
        <ul className="space-y-0.5">
          {categories.map((c) => {
            const active = filters.category === c.slug;
            return (
              <li key={c.id}>
                <Link
                  href={buildHref({ category: active ? null : c.slug })}
                  className={cn(
                    "hover:bg-accent flex items-center justify-between rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {c.name}
                  {typeof c.count === "number" ? (
                    <span className="text-muted-foreground text-xs">{c.count}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => {
            const active = filters.brand === b.slug;
            return (
              <Link
                key={b.id}
                href={buildHref({ brand: active ? null : b.slug })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {b.name}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        <ul className="space-y-0.5">
          {conditionEntries.map(([value, label]) => {
            const active = filters.condition === value;
            return (
              <li key={value}>
                <Link
                  href={buildHref({ condition: active ? null : value })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price (PKR)">
        <PriceRangeFilter
          key={`${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`}
          min={filters.minPrice}
          max={filters.maxPrice}
          onApply={onApply}
        />
      </FilterGroup>

      <FilterGroup title="City">
        <select
          value={filters.city ?? ""}
          onChange={(e) => {
            router.push(buildHref({ city: e.target.value || null }));
            onApply?.();
          }}
          aria-label="Filter by city"
          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        >
          <option value="">All cities</option>
          {locations.flatMap((country) =>
            country.cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name} · {country.name}
              </option>
            )),
          )}
        </select>
      </FilterGroup>

      {filterOptions.storage.length > 0 ? (
        <FilterGroup title="Storage">
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.storage.map((storage) => {
              const active = filters.storage === storage;
              return (
                <Link
                  key={storage}
                  href={buildHref({ storage: active ? null : storage })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {storage.match(/^(?:\d+(?:\.\d+)?)$/) ? `${storage}GB` : storage}
                </Link>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {filterOptions.ram.length > 0 ? (
        <FilterGroup title="RAM">
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.ram.map((ram) => {
              const active = filters.ram === ram;
              return (
                <Link
                  key={ram}
                  href={buildHref({ ram: active ? null : ram })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {ram.match(/^(?:\d+(?:\.\d+)?)$/) ? `${ram}GB` : ram}
                </Link>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {filterOptions.colors.length > 0 ? (
        <FilterGroup title="Color">
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.colors.map((color) => {
              const active = filters.color === color;
              return (
                <Link
                  key={color}
                  href={buildHref({ color: active ? null : color })}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  {color}
                </Link>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Battery Health">
        <BatteryHealthFilter
          key={filters.batteryHealthMin ?? "any"}
          value={filters.batteryHealthMin}
          onApply={onApply}
        />
      </FilterGroup>

      <FilterGroup title="PTA Status">
        <ul className="space-y-0.5">
          {Object.entries(PTA_STATUS).map(([value, label]) => {
            const active = filters.ptaStatus === value;
            return (
              <li key={value}>
                <Link
                  href={buildHref({ ptaStatus: active ? null : value })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {label.replace(/_/g, " ")}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="CPID Status">
        <ul className="space-y-0.5">
          {Object.entries(CPID_STATUS).map(([value, label]) => {
            const active = filters.cpidStatus === value;
            return (
              <li key={value}>
                <Link
                  href={buildHref({ cpidStatus: active ? null : value })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {label.replace(/_/g, " ")}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Warranty">
        <ul className="space-y-0.5">
          {Object.entries(WARRANTY_TYPE).map(([value, label]) => {
            const active = filters.warranty === value;
            return (
              <li key={value}>
                <Link
                  href={buildHref({ warranty: active ? null : value })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {label.replace(/_/g, " ")}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Trust">
        <ul className="space-y-0.5">
          <li>
            <Link
              href={buildHref({ isInspected: filters.isInspected ? null : "true" })}
              className={cn(
                "hover:bg-accent block rounded-md px-2 py-1.5",
                filters.isInspected && "bg-accent font-medium",
              )}
            >
              Inspected only
            </Link>
          </li>
          <li>
            <Link
              href={buildHref({ isVerifiedSeller: filters.isVerifiedSeller ? null : "true" })}
              className={cn(
                "hover:bg-accent block rounded-md px-2 py-1.5",
                filters.isVerifiedSeller && "bg-accent font-medium",
              )}
            >
              Verified sellers only
            </Link>
          </li>
          <li>
            <Link
              href={buildHref({ isDealer: filters.isDealer ? null : "true" })}
              className={cn(
                "hover:bg-accent block rounded-md px-2 py-1.5",
                filters.isDealer && "bg-accent font-medium",
              )}
            >
              Dealers only
            </Link>
          </li>
        </ul>
      </FilterGroup>
    </div>
  );
}
