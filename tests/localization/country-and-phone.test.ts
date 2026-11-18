import { describe, expect, it } from "vitest";

import { getAllSupportedLocales, getCountryConfig, getDefaultLocale } from "@/lib/countries";
import { isRtlLocale } from "@/lib/countries/types";
import { isValidPhoneForCountry, validatePhoneForCountry } from "@/lib/validation/phone";

describe("country-specific configuration", () => {
  it("keeps Bahrain on BHD with Bahrain-only commerce settings", () => {
    const config = getCountryConfig("BH");
    expect(config.defaultCurrency).toBe("BHD");
    expect(config.taxConfig.vatRate).toBe(0.05);
    expect(config.paymentMethods).toContain("benefitpay");
    expect(config.paymentMethods).not.toContain("jazzcash");
    expect(config.shippingMethods).toContain("local_delivery");
  });

  it("keeps Pakistan on PKR with Pakistan-only commerce settings", () => {
    const config = getCountryConfig("PK");
    expect(config.defaultCurrency).toBe("PKR");
    expect(config.taxConfig.vatRate).toBe(0);
    expect(config.paymentMethods).toContain("jazzcash");
    expect(config.paymentMethods).not.toContain("benefitpay");
    expect(config.shippingMethods).toContain("local_courier");
  });

  it("offers all three languages in both countries", () => {
    for (const country of ["BH", "PK"] as const) {
      expect(getCountryConfig(country).availableLocales).toEqual(getAllSupportedLocales());
      expect(getAllSupportedLocales()).toEqual(["en", "ar", "ur"]);
    }
    expect(getDefaultLocale("BH")).toBe("ar");
    expect(getDefaultLocale("PK")).toBe("ur");
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("ur")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
  });
});

describe("country-specific phone validation", () => {
  it("validates Bahrain numbers with optional +973 prefix", () => {
    expect(isValidPhoneForCountry("+973 1234 5678", "BH")).toBe(true);
    expect(isValidPhoneForCountry("12345678", "BH")).toBe(true);
    expect(isValidPhoneForCountry("+92 300 1234567", "BH")).toBe(false);
  });

  it("validates Pakistan mobile numbers with optional +92 or 0 prefix", () => {
    expect(isValidPhoneForCountry("0300 1234567", "PK")).toBe(true);
    expect(isValidPhoneForCountry("+92 300 1234567", "PK")).toBe(true);
    expect(isValidPhoneForCountry("+973 1234 5678", "PK")).toBe(false);
  });

  it("returns a country-specific error only for invalid non-empty values", () => {
    expect(validatePhoneForCountry(undefined, "BH")).toBeNull();
    expect(validatePhoneForCountry("+973 1234 5678", "BH")).toBeNull();
    expect(validatePhoneForCountry("111", "BH")).toContain("Bahrain");
    expect(validatePhoneForCountry("111", "PK")).toContain("Pakistan");
  });
});
