"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { LISTING_CONDITION_LABELS, PK_CITIES, STORAGE_OPTIONS, RAM_OPTIONS, WARRANTY_TYPE, PTA_STATUS, CPID_STATUS } from "@/lib/constants";
import type { BrandItem, CategoryItem, ListingFilters } from "@/types/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

interface Props {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: ListingFilters;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function MarketplaceFilters({ categories, brands, filters }: Props) {
  const router = useRouter();
  const buildHref = useListingHref();

  const [minPrice, setMinPrice] = React.useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = React.useState(filters.maxPrice?.toString() ?? "");
  const [batteryHealthMin, setBatteryHealthMin] = React.useState(filters.batteryHealthMin?.toString() ?? "");

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref({ minPrice: minPrice || null, maxPrice: maxPrice || null }));
  }

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
                onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
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
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Any"
                className="h-9"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Apply price
          </Button>
        </form>
      </FilterGroup>

      <FilterGroup title="City">
        <select
          value={filters.city ?? ""}
          onChange={(e) => router.push(buildHref({ city: e.target.value || null }))}
          aria-label="Filter by city"
          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        >
          <option value="">All cities</option>
          {PK_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Storage">
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map((storage) => {
            const active = filters.storage === storage;
            return (
              <Link
                key={storage}
                href={buildHref({ storage: active ? null : storage })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {storage}GB
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="RAM">
        <div className="flex flex-wrap gap-1.5">
          {RAM_OPTIONS.map((ram) => {
            const active = filters.ram === ram;
            return (
              <Link
                key={ram}
                href={buildHref({ ram: active ? null : ram })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {ram}GB
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Battery Health">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              value={batteryHealthMin}
              onChange={(e) => setBatteryHealthMin(e.target.value.replace(/\D/g, ""))}
              placeholder="Min %"
              className="h-9"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(buildHref({ batteryHealthMin: batteryHealthMin || null }))}
            >
              Apply
            </Button>
          </div>
        </div>
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
