import type { StateContact } from "@/lib/types";

/**
 * Plan P1-8 — the State/UT directory.
 *
 * The 28 States and 8 Union Territories below are complete and correct.
 * Officer names, ranks, phone numbers, and email addresses are NOT populated:
 * they must be transcribed from the official directory at
 * https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx
 * or supplied by the API. Do not invent them — these are real public officials
 * and citizens will act on this data.
 *
 * When transcribing, store plain email addresses. The source page obfuscates
 * them as "[at]" / "[dot]"; that obfuscation is stripped here so mailto: and
 * screen readers work (see ContactCard).
 */
function pending(state: string, slug: string): StateContact {
  return {
    slug,
    state,
    nodalOfficer: { name: "" },
  };
}

export const stateContacts: StateContact[] = [
  pending("Andhra Pradesh", "andhra-pradesh"),
  pending("Arunachal Pradesh", "arunachal-pradesh"),
  pending("Assam", "assam"),
  pending("Bihar", "bihar"),
  pending("Chhattisgarh", "chhattisgarh"),
  pending("Goa", "goa"),
  pending("Gujarat", "gujarat"),
  pending("Haryana", "haryana"),
  pending("Himachal Pradesh", "himachal-pradesh"),
  pending("Jharkhand", "jharkhand"),
  pending("Karnataka", "karnataka"),
  pending("Kerala", "kerala"),
  pending("Madhya Pradesh", "madhya-pradesh"),
  pending("Maharashtra", "maharashtra"),
  pending("Manipur", "manipur"),
  pending("Meghalaya", "meghalaya"),
  pending("Mizoram", "mizoram"),
  pending("Nagaland", "nagaland"),
  pending("Odisha", "odisha"),
  pending("Punjab", "punjab"),
  pending("Rajasthan", "rajasthan"),
  pending("Sikkim", "sikkim"),
  pending("Tamil Nadu", "tamil-nadu"),
  pending("Telangana", "telangana"),
  pending("Tripura", "tripura"),
  pending("Uttar Pradesh", "uttar-pradesh"),
  pending("Uttarakhand", "uttarakhand"),
  pending("West Bengal", "west-bengal"),
  pending("Andaman and Nicobar Islands", "andaman-and-nicobar-islands"),
  pending("Chandigarh", "chandigarh"),
  pending(
    "Dadra and Nagar Haveli and Daman and Diu",
    "dadra-and-nagar-haveli-and-daman-and-diu",
  ),
  pending("Delhi", "delhi"),
  pending("Jammu and Kashmir", "jammu-and-kashmir"),
  pending("Ladakh", "ladakh"),
  pending("Lakshadweep", "lakshadweep"),
  pending("Puducherry", "puducherry"),
];

export function findStateContact(slug: string): StateContact | undefined {
  return stateContacts.find((contact) => contact.slug === slug);
}
