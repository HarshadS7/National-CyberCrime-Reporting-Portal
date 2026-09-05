"use server";

import { suspectSearchSchema } from "@/lib/schemas/suspect";
import { searchSuspect } from "@/lib/api/client";
import type { SuspectSearchResult } from "@/lib/types";

export interface CheckSuspectState {
  fieldErrors?: Record<string, string>;
  searched?: boolean;
  result?: SuspectSearchResult | null;
}

export async function checkSuspectAction(
  _prev: CheckSuspectState,
  formData: FormData,
): Promise<CheckSuspectState> {
  const parsed = suspectSearchSchema.safeParse({
    identifier: formData.get("identifier"),
    challengeId: formData.get("challengeId"),
    captcha: formData.get("captcha"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const result = await searchSuspect(parsed.data.identifier);
  return { searched: true, result };
}
