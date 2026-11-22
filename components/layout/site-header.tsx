import { LayoutGrid, Plus, ShieldCheck } from "lucide-react";

import { ActiveLocalizedLink } from "@/components/layout/active-localized-link";

import { APP, ROUTES, USER_ROLES, type UserRole } from "@/lib/constants";
import { getRequestCountryLocale } from "@/lib/countries/server";
import { getRegionForCountry } from "@/lib/countries/server";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/localized-link";
import { getCurrentSession } from "@/lib/session";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/features/notifications/services/notification.service";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CountryLocaleSelector } from "@/components/country-locale-selector";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { SearchBar } from "@/features/marketplace/components/search-bar";
import { getDemoCategories } from "@/features/marketplace/data/fixtures";
import { getActiveLocationTree } from "@/features/locations/services/location.service";

/** Global marketplace header with country-scoped categories and locations. */
export async function SiteHeader() {
  const session = await getCurrentSession();
  const user = session?.user;
  const t = await getServerTranslations("navigation");
  const { country } = await getRequestCountryLocale();
  const categories = getDemoCategories(getRegionForCountry(country));

  const [unreadNotifications, recentNotifications, locations] = await Promise.all([
    user ? getUnreadNotificationCount(user.id) : Promise.resolve(0),
    user ? getNotifications(user.id, 6) : Promise.resolve([]),
    getActiveLocationTree(country),
  ]);

  return (
    <header className="sticky top-2 z-40 mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-6xl">
      <div className="rounded-2xl border border-border/60 bg-background/85 shadow-lg shadow-foreground/5 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <MobileNav categories={categories} isAuthenticated={Boolean(user)} />

          <LocalizedLink
            href={ROUTES.home}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg text-sm font-semibold">
              {APP.name.charAt(0)}
            </span>
            <span className="hidden sm:inline">{APP.name}</span>
          </LocalizedLink>

          <nav aria-label={t("navigation")} className="hidden items-center gap-1 lg:flex">
            <ActiveLocalizedLink
              href={ROUTES.marketplace}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-2 px-3 font-medium",
              )}
            >
              <LayoutGrid className="size-4" />
              {t("marketplace")}
            </ActiveLocalizedLink>
            <ActiveLocalizedLink
              href={ROUTES.inspectionService}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-2 px-3 font-medium",
              )}
            >
              <ShieldCheck className="size-4" />
              {t("inspection")}
            </ActiveLocalizedLink>
          </nav>

          <div className="mx-2 hidden flex-1 md:block">
            <SearchBar variant="compact" locations={locations} />
          </div>

          <nav aria-label={t("account")} className="ms-auto flex items-center gap-1.5">
            <LocalizedLink
              href={ROUTES.sell}
              className={cn(buttonVariants({ size: "sm" }), "hidden gap-2 rounded-lg sm:inline-flex")}
            >
              <Plus className="size-4" />
              {t("sell")}
            </LocalizedLink>

            <CountryLocaleSelector />
            <ThemeToggle />

            {user ? (
              <NotificationBell
                initialCount={unreadNotifications}
                initialItems={recentNotifications}
              />
            ) : null}

            {user ? (
              <UserMenu
                userId={user.id}
                name={user.name}
                email={user.email}
                image={user.image}
                role={(user.role as UserRole | "DEALER" | undefined) ?? USER_ROLES.USER}
              />
            ) : (
              <LocalizedLink
                href={ROUTES.signIn}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                {t("signIn")}
              </LocalizedLink>
            )}
          </nav>
        </div>

        <div className="border-t px-3 py-2 md:hidden">
          <SearchBar variant="compact" locations={locations} />
        </div>
      </div>
    </header>
  );
}
