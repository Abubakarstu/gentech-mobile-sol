import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileSplashScreen } from "@/components/layout/mobile-splash-screen";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => (key === "loading" ? "Loading..." : key),
}));

describe("mobile splash screen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a branded status overlay and removes it after the launch delay", () => {
    render(<MobileSplashScreen />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("Loading...")).toBeTruthy();

    act(() => vi.advanceTimersByTime(900));

    expect(screen.queryByRole("status")).toBeNull();
  });
});
