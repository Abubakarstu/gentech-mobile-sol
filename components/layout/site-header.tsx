import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";

import { APP, ROUTES, USER_ROLES, type UserRole } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
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
import { DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { getActiveLocationTree } from "@/features/locations/services/location.service";

/**
 * Global marketplace header. Server component — reads the session once and renders
 * either the signed-out actions or the user menu. Search + mobile drawer are client.
 */
export async function SiteHeader() {
  const session = await getCurrentSession();
  const user = session?.user;
  const t = await getTranslations("navigation");
  const isDemoSession = user?.id.startsWith("demo:") ?? false;

  const [unreadNotifications, recentNotifications, locations] = await Promise.all([
    user && !isDemoSession
      ? getUnreadNotificationCount(user.id)
      : Promise.resolve(0),
    user && !isDemoSession ? getNotifications(user.id, 6) : Promise.resolve([]),
    getActiveLocationTree(),
  ]);

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <MobileNav
          categories={DEMO_CATEGORIES}
          isAuthenticated={Boolean(user)}
          isDemoSession={isDemoSession}
        />

        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
        >
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-sm font-bold">
            {APP.name.charAt(0)}
          </span>
          <span className="hidden sm:inline">{APP.name}</span>
        </Link>

        {/* Desktop search */}
        <div className="mx-2 hidden flex-1 md:block">
          <SearchBar variant="compact" locations={locations} />
        </div>

        <nav className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href={ROUTES.inspectionService}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden lg:inline-flex",
            )}
          >
            <ShieldCheck className="size-4" />
            {t("inspection")}
          </Link>

          {!isDemoSession ? (
            <Link
              href={ROUTES.sell}
              className={cn(buttonVariants({ size: "sm" }), "hidden rounded-full sm:inline-flex")}
            >
              <Plus className="size-4" />
              {t("sell")}
            </Link>
          ) : null}

          <CountryLocaleSelector />

          <ThemeToggle />

          {user && !isDemoSession ? (
            <NotificationBell
              initialCount={unreadNotifications}
              initialItems={recentNotifications}
            />
          ) : null}

          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              image={user.image}
              role={(user.role as UserRole | "DEALER" | undefined) ?? USER_ROLES.USER}
              isDemoSession={isDemoSession}
              isDemoDealer={user.id === "demo:dealer"}
            />
          ) : (
            <Link
              href={ROUTES.signIn}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              {t("signIn")}
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile search row */}
      <div className="border-t px-4 py-2 md:hidden">
        <SearchBar variant="compact" locations={locations} />
      </div>
    </header>
  );
}
