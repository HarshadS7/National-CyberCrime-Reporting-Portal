import type { StateContact } from "@/lib/types";

/**
 * DEMO MODE — see README "Known gaps".
 *
 * The 28 States and 8 Union Territories below are real and complete. The
 * officer names, ranks, phone numbers, and emails are SAMPLE DATA for design
 * review: they are not real officials, and the email domain
 * ("cybercell.sample.example") deliberately does not resolve, so it cannot be
 * mistaken for a genuine government address.
 *
 * Before launch this file must be replaced with data transcribed from
 * https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx or served by
 * the API — do not ship sample data to production.
 */
function sample(state: string, slug: string): StateContact {
  return {
    slug,
    state,
    nodalOfficer: {
      name: "Sample Nodal Officer",
      rank: "Deputy Superintendent of Police, Cyber Cell",
      phone: "1800 000 0000",
      email: `nodal.${slug}@cybercell.sample.example`,
    },
    grievanceOfficer: {
      name: "Sample Grievance Officer",
      rank: "Grievance Cell",
      email: `grievance.${slug}@cybercell.sample.example`,
    },
  };
}

export const stateContacts: StateContact[] = [
  sample("Andhra Pradesh", "andhra-pradesh"),
  sample("Arunachal Pradesh", "arunachal-pradesh"),
  sample("Assam", "assam"),
  sample("Bihar", "bihar"),
  sample("Chhattisgarh", "chhattisgarh"),
  sample("Goa", "goa"),
  sample("Gujarat", "gujarat"),
  sample("Haryana", "haryana"),
  sample("Himachal Pradesh", "himachal-pradesh"),
  sample("Jharkhand", "jharkhand"),
  sample("Karnataka", "karnataka"),
  sample("Kerala", "kerala"),
  sample("Madhya Pradesh", "madhya-pradesh"),
  sample("Maharashtra", "maharashtra"),
  sample("Manipur", "manipur"),
  sample("Meghalaya", "meghalaya"),
  sample("Mizoram", "mizoram"),
  sample("Nagaland", "nagaland"),
  sample("Odisha", "odisha"),
  sample("Punjab", "punjab"),
  sample("Rajasthan", "rajasthan"),
  sample("Sikkim", "sikkim"),
  sample("Tamil Nadu", "tamil-nadu"),
  sample("Telangana", "telangana"),
  sample("Tripura", "tripura"),
  sample("Uttar Pradesh", "uttar-pradesh"),
  sample("Uttarakhand", "uttarakhand"),
  sample("West Bengal", "west-bengal"),
  sample("Andaman and Nicobar Islands", "andaman-and-nicobar-islands"),
  sample("Chandigarh", "chandigarh"),
  sample(
    "Dadra and Nagar Haveli and Daman and Diu",
    "dadra-and-nagar-haveli-and-daman-and-diu",
  ),
  sample("Delhi", "delhi"),
  sample("Jammu and Kashmir", "jammu-and-kashmir"),
  sample("Ladakh", "ladakh"),
  sample("Lakshadweep", "lakshadweep"),
  sample("Puducherry", "puducherry"),
];

export function findStateContact(slug: string): StateContact | undefined {
  return stateContacts.find((contact) => contact.slug === slug);
}
