"use server";

import { suspectReportSchema } from "@/lib/schemas/suspect";
import { reportSuspect } from "@/lib/api/client";

export interface ReportSuspectState {
  fieldErrors?: Record<string, string>;
  referenceId?: string;
}

export async function reportSuspectAction(
  _prev: ReportSuspectState,
  formData: FormData,
): Promise<ReportSuspectState> {
  const parsed = suspectReportSchema.safeParse({
    kind: formData.get("kind"),
    identifier: formData.get("identifier"),
    description: formData.get("description") || undefined,
    stateSlug: formData.get("stateSlug"),
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

  const { referenceId } = await reportSuspect(parsed.data);
  return { referenceId };
}
