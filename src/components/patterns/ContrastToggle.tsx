"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "ncrp-contrast";

/**
 * Plan §5 — high contrast is a token override on the root element.
 * Preference persists per browser; it never changes layout.
 */
export function ContrastToggle() {
  const t = useTranslations("common");
  const [high, setHigh] = useState(false);

  useEffect(() => {
    try {
      setHigh(window.localStorage.getItem(STORAGE_KEY) === "high");
    } catch {
      // Storage can throw in private mode. The default is correct anyway.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.contrast = high ? "high" : "normal";
    try {
      window.localStorage.setItem(STORAGE_KEY, high ? "high" : "normal");
    } catch {
      // Non-fatal: the toggle still works for this page view.
    }
  }, [high]);

  return (
    <Button
      variant="tertiary"
      aria-pressed={high}
      onClick={() => setHigh((value) => !value)}
      className="text-sm"
    >
      {t("contrastToggle")}
    </Button>
  );
}
