"use server";

import type { ComplaintCategory } from "@/lib/types";
import { submitComplaint } from "@/lib/api/client";

export interface SubmitComplaintState {
  acknowledgementNumber?: string;
}

export async function submitComplaintAction(
  category: ComplaintCategory,
  anonymous: boolean,
  _prev: SubmitComplaintState,
  _formData: FormData,
): Promise<SubmitComplaintState> {
  const { acknowledgementNumber } = await submitComplaint({
    category,
    anonymous,
  });
  return { acknowledgementNumber };
}
