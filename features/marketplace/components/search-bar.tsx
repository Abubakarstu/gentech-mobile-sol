"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Layers, Loader2, Search, Smartphone, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/localized-link";
import { useLocalizedRouteInfo, withLocalizedPrefix } from "@/lib/localized-routing";
import { trackSearch } from "@/features/analytics/lib/events";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LocationTree } from "@/features/locations/services/location.service";

interface Suggestions {
  listings: Array<{ title: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
  brands: Array<{ name: string; slug: string }>;
}

interface SearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
  withCity?: boolean;
  placeholder?: string;
  locations?: LocationTree;
}

export function SearchBar({
  variant = "hero",
  className,
  withCity = variant === "hero",
  placeholder,
  locations = [],
}: SearchBarProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const { country, prefix } = useLocalizedRouteInfo();
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<Suggestions | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const debounced = useDebouncedValue(query, 200);
  const pending = query.trim().length >= 2 && query !== debounced;

  const relevantLocations = React.useMemo(
    () =>
      country
        ? locations.filter((entry) => entry.code.toUpperCase() === country)
        : locations,
    [country, locations],
  );

  React.useEffect(() => {
    const term = debounced.trim();
    if (term.length < 2) return;
    let active = true;
    const countryParam = country ? `&country=${country}` : "";
    fetch(`/api/v1/search/suggest?q=${encodeURIComponent(term)}${countryParam}`)
      .then((r) => (r.ok ? (r.json() as Promise<Suggestions>) : null))
      .then((data) => {
        if (active && data) setResults(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [country, debounced]);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(withLocalizedPrefix(href, prefix));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const term = query.trim();
    if (term) params.set("q", term);
    if (city) params.set("city", city);
    if (term) trackSearch(term, city || undefined);
    navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const hasResults =
    results &&
    (results.listings.length > 0 || results.categories.length > 0 || results.brands.length > 0);
  const showDropdown = open && query.trim().length >= 2 && Boolean(hasResults);

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex w-full items-center gap-2",
          variant === "hero" &&
            "bg-card rounded-2xl border p-2 shadow-sm sm:gap-0 sm:rounded-full sm:p-1.5",
          className,
        )}
      >
        <div className="relative flex-1">
          {pending ? (
            <Loader2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin" />
          ) : (
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          )}
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder ?? t("placeholder")}
            aria-label={t("button")}
            autoComplete="off"
            className={cn(
              "pl-9",
              variant === "hero" &&
                "h-11 border-0 bg-transparent shadow-none focus-visible:ring-0",
            )}
          />
        </div>

        {withCity ? (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label={t("allCities")}
            className="border-input bg-background h-11 rounded-md border px-3 text-sm sm:border-0 sm:bg-transparent"
          >
            <option value="">{t("allCities")}</option>
            {relevantLocations.flatMap((entry) =>
              entry.cities.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              )),
            )}
          </select>
        ) : null}

        <Button type="submit" size={variant === "hero" ? "lg" : "default"} className="rounded-full">
          <Search className="size-4 sm:hidden" />
          <span className="hidden sm:inline">{t("button")}</span>
        </Button>
      </form>

      {showDropdown && results ? (
        <div className="bg-popover absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-lg">
          {results.listings.length > 0 ? (
            <Group label={t("groupListings")}>
              {results.listings.map((listing) => (
                <button
                  key={listing.slug}
                  type="button"
                  onClick={() => navigate(`/listings/${listing.slug}`)}
                  className="hover:bg-accent flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                >
                  <Smartphone className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate">{listing.title}</span>
                </button>
              ))}
            </Group>
          ) : null}

          {results.categories.length > 0 ? (
            <Group label={t("groupCategories")}>
              {results.categories.map((category) => (
                <SuggestionLink
                  key={category.slug}
                  href={`/marketplace?category=${category.slug}`}
                  icon={<Layers className="text-muted-foreground size-4 shrink-0" />}
                  label={category.name}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </Group>
          ) : null}

          {results.brands.length > 0 ? (
            <Group label={t("groupBrands")}>
              {results.brands.map((brand) => (
                <SuggestionLink
                  key={brand.slug}
                  href={`/marketplace?brand=${brand.slug}`}
                  icon={<Tag className="text-muted-foreground size-4 shrink-0" />}
                  label={brand.name}
                  onSelect={() => setOpen(false)}
                />
              ))}
            </Group>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-1 last:border-b-0">
      <p className="text-muted-foreground px-3 py-1 text-xs font-semibold uppercase">{label}</p>
      {children}
    </div>
  );
}

function SuggestionLink({
  href,
  icon,
  label,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <LocalizedLink
      href={href}
      onClick={onSelect}
      className="hover:bg-accent flex items-center gap-2 px-3 py-2 text-sm"
    >
      {icon}
      <span className="truncate">{label}</span>
    </LocalizedLink>
  );
}
