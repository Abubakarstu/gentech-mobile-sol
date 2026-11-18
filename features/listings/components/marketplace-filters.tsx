"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { LISTING_CONDITIONS, PTA_STATUS, CPID_STATUS, WARRANTY_TYPE } from "@/lib/constants";
import { useLocalizedRouteInfo } from "@/lib/localized-routing";
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

function StatusLinks({
  values,
  active,
  buildHref,
  keyName,
  translate,
}: {
  values: readonly string[];
  active?: string;
  buildHref: (patch: Record<string, string | null>) => string;
  keyName: string;
  translate: (key: string) => string;
}) {
  return (
    <ul className="space-y-0.5">
      {values.map((value) => {
        const isActive = active === value;
        return (
          <li key={value}>
            <Link
              href={buildHref({ [keyName]: isActive ? null : value })}
              className={cn(
                "hover:bg-accent block rounded-md px-2 py-1.5",
                isActive && "bg-accent font-medium",
              )}
            >
              {translate(value)}
            </Link>
          </li>
        );
      })}
    </ul>
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
  const t = useTranslations("filters");
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
            {t("minPrice")}
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
            {t("maxPrice")}
          </Label>
          <Input
            id="maxPrice"
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))}
            placeholder={t("any")}
            className="h-9"
          />
        </div>
      </div>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        {t("applyPrice")}
      </Button>
    </form>
  );
}

function BatteryHealthFilter({ value, onApply }: { value?: number; onApply?: () => void }) {
  const router = useRouter();
  const buildHref = useListingHref();
  const t = useTranslations("filters");
  const [batteryHealthMin, setBatteryHealthMin] = React.useState(value?.toString() ?? "");

  return (
    <div className="flex items-center gap-2">
      <Input
        inputMode="numeric"
        value={batteryHealthMin}
        onChange={(event) => setBatteryHealthMin(event.target.value.replace(/\D/g, "").slice(0, 3))}
        placeholder={t("minPercent")}
        aria-label={t("batteryHealth")}
        className="h-9"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          router.push(buildHref({ batteryHealthMin: batteryHealthMin || null }));
          onApply?.();
        }}
      >
        {t("apply")}
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
  const t = useTranslations("filters");
  const tCondition = useTranslations("condition");
  const tStatus = useTranslations("status");
  const tCategories = useTranslations("categories");
  const { country } = useLocalizedRouteInfo();
  const showPakistanSignals = country === "PK";

  return (
    <div className="text-sm">
      <FilterGroup title={t("category")}>
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const active = filters.category === category.slug;
            return (
              <li key={category.id}>
                <Link
                  href={buildHref({ category: active ? null : category.slug })}
                  className={cn(
                    "hover:bg-accent flex items-center justify-between rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {tCategories.has(category.slug) ? tCategories(category.slug) : category.name}
                  {typeof category.count === "number" ? (
                    <span className="text-muted-foreground text-xs">{category.count}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("brand")}>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => {
            const active = filters.brand === brand.slug;
            return (
              <Link
                key={brand.id}
                href={buildHref({ brand: active ? null : brand.slug })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {brand.name}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title={t("condition")}>
        <ul className="space-y-0.5">
          {Object.values(LISTING_CONDITIONS).map((condition) => {
            const active = filters.condition === condition;
            return (
              <li key={condition}>
                <Link
                  href={buildHref({ condition: active ? null : condition })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {tCondition(condition)}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title={t("priceRange")}>
        <PriceRangeFilter
          key={`${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`}
          min={filters.minPrice}
          max={filters.maxPrice}
          onApply={onApply}
        />
      </FilterGroup>

      <FilterGroup title={t("city")}>
        <select
          value={filters.city ?? ""}
          onChange={(event) => {
            router.push(buildHref({ city: event.target.value || null }));
            onApply?.();
          }}
          aria-label={t("city")}
          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        >
          <option value="">{t("allCities")}</option>
          {locations.flatMap((countryEntry) =>
            countryEntry.cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            )),
          )}
        </select>
      </FilterGroup>

      {filterOptions.storage.length > 0 ? (
        <FilterGroup title={t("storage")}>
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
                  {/^\d+(?:\.\d+)?$/.test(storage) ? `${storage}${t("gb")}` : storage}
                </Link>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {filterOptions.ram.length > 0 ? (
        <FilterGroup title={t("ram")}>
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
                  {/^\d+(?:\.\d+)?$/.test(ram) ? `${ram}${t("gb")}` : ram}
                </Link>
              );
            })}
          </div>
        </FilterGroup>
      ) : null}

      {filterOptions.colors.length > 0 ? (
        <FilterGroup title={t("color")}>
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

      <FilterGroup title={t("batteryHealth")}>
        <BatteryHealthFilter
          key={filters.batteryHealthMin ?? "any"}
          value={filters.batteryHealthMin}
          onApply={onApply}
        />
      </FilterGroup>

      {showPakistanSignals ? (
        <>
          <FilterGroup title={t("ptaStatus")}>
            <StatusLinks
              values={Object.values(PTA_STATUS)}
              active={filters.ptaStatus}
              buildHref={buildHref}
              keyName="ptaStatus"
              translate={(value) => tStatus(value)}
            />
          </FilterGroup>
          <FilterGroup title={t("cpidStatus")}>
            <StatusLinks
              values={Object.values(CPID_STATUS)}
              active={filters.cpidStatus}
              buildHref={buildHref}
              keyName="cpidStatus"
              translate={(value) => tStatus(value)}
            />
          </FilterGroup>
        </>
      ) : null}

      <FilterGroup title={t("warranty")}>
        <StatusLinks
          values={Object.values(WARRANTY_TYPE)}
          active={filters.warranty}
          buildHref={buildHref}
          keyName="warranty"
          translate={(value) => tStatus(value)}
        />
      </FilterGroup>

      <FilterGroup title={t("trust")}>
        <ul className="space-y-0.5">
          <TrustLink label={t("inspectedOnly")} active={filters.isInspected} buildHref={buildHref} keyName="isInspected" />
          <TrustLink label={t("verifiedSellersOnly")} active={filters.isVerifiedSeller} buildHref={buildHref} keyName="isVerifiedSeller" />
          <TrustLink label={t("dealersOnly")} active={filters.isDealer} buildHref={buildHref} keyName="isDealer" />
        </ul>
      </FilterGroup>
    </div>
  );
}

function TrustLink({
  label,
  active,
  buildHref,
  keyName,
}: {
  label: string;
  active?: boolean;
  buildHref: (patch: Record<string, string | null>) => string;
  keyName: string;
}) {
  return (
    <li>
      <Link
        href={buildHref({ [keyName]: active ? null : "true" })}
        className={cn(
          "hover:bg-accent block rounded-md px-2 py-1.5",
          active && "bg-accent font-medium",
        )}
      >
        {label}
      </Link>
    </li>
  );
}
