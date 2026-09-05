import type { FaqEntry } from "@/lib/types";

/**
 * Plan P2-10 — grouped, searchable FAQ content.
 *
 * Content lives here rather than in messages/*.json: it is long-form page
 * content, not UI chrome, and keeping it out of the message catalogues stops
 * those files from growing unmanageably. Every entry must exist in both
 * locale arrays with a matching id.
 */

const en: FaqEntry[] = [
  {
    id: "how-to-report",
    topic: "reporting",
    question: "How do I report a cyber crime?",
    answer:
      "Choose the category that matches what happened from the homepage, then follow the form. You can report anonymously, or provide your details so you can track the complaint afterwards.",
  },
  {
    id: "is-reporting-free",
    topic: "reporting",
    question: "Does it cost anything to report?",
    answer: "No. Reporting a cyber crime through this portal is free.",
  },
  {
    id: "anonymous-vs-tracked",
    topic: "reporting",
    question:
      "What is the difference between reporting anonymously and reporting and tracking?",
    answer:
      "Reporting and tracking gives you an acknowledgement number so you can check progress later. Reporting anonymously does not identify you, but you will not be able to track that specific report.",
  },
  {
    id: "what-evidence",
    topic: "evidence",
    question: "What evidence should I keep?",
    answer:
      "Keep screenshots of messages, transaction references, the sender's phone number or email, and any call recordings. Do not delete the original messages or emails.",
  },
  {
    id: "evidence-after-filing",
    topic: "evidence",
    question: "Can I add evidence after I have already filed a complaint?",
    answer:
      "Yes. Contact the cyber cell handling your case using the acknowledgement number, or reach your State or Union Territory officer from the contacts page.",
  },
  {
    id: "otp-not-received",
    topic: "account",
    question: "I did not receive the OTP. What do I do?",
    answer:
      "Wait a minute and use the resend option. If it still does not arrive, confirm the mobile number registered with your complaint is correct, or contact your State cyber cell.",
  },
  {
    id: "otp-purpose",
    topic: "account",
    question: "Why do I need an OTP to track my complaint?",
    answer:
      "The OTP confirms that the person checking the status is the same person who filed it, protecting the details of your complaint from anyone else who might have your acknowledgement number.",
  },
  {
    id: "how-to-track",
    topic: "tracking",
    question: "How do I track my complaint?",
    answer:
      "Go to Track complaint, enter your acknowledgement number, then verify with the OTP sent to your registered mobile number.",
  },
  {
    id: "no-ack-number",
    topic: "tracking",
    question:
      "I lost my acknowledgement number. Can I still track my complaint?",
    answer:
      "Contact your State or Union Territory cyber cell directly from the contacts page — they can look up your complaint using your other details.",
  },
  {
    id: "how-to-withdraw",
    topic: "withdrawal",
    question: "Can I withdraw a complaint I filed?",
    answer:
      "Contact the cyber cell handling your case directly. Withdrawal is handled by the investigating officer, not through this website.",
  },
  {
    id: "false-complaint",
    topic: "withdrawal",
    question: "What happens if I filed a complaint by mistake?",
    answer:
      "Contact the cyber cell handling your case as soon as possible using your acknowledgement number to correct or close the record.",
  },
  {
    id: "avoid-scams",
    topic: "safety",
    question: "How do I avoid falling for the same scam again?",
    answer:
      "Government officers never ask for OTPs, passwords, or advance payments over phone or email. Verify any unexpected request by contacting the organisation directly using details you look up yourself.",
  },
  {
    id: "fake-officials",
    topic: "safety",
    question: "How do I recognise a fake email claiming to be from a cyber cell?",
    answer:
      "Check the sender's email domain carefully, and remember that real officials will never ask you to pay money or share an OTP by email or phone.",
  },
];

const hi: FaqEntry[] = [
  {
    id: "how-to-report",
    topic: "reporting",
    question: "मैं साइबर अपराध की शिकायत कैसे करूँ?",
    answer:
      "होमपेज से वह श्रेणी चुनें जो आपके साथ हुई घटना से मेल खाती हो, फिर फ़ॉर्म भरें। आप गुमनाम रूप से शिकायत कर सकते हैं, या अपनी जानकारी देकर बाद में शिकायत ट्रैक कर सकते हैं।",
  },
  {
    id: "is-reporting-free",
    topic: "reporting",
    question: "क्या शिकायत करने में कोई शुल्क लगता है?",
    answer: "नहीं। इस पोर्टल के माध्यम से साइबर अपराध की शिकायत करना निःशुल्क है।",
  },
  {
    id: "anonymous-vs-tracked",
    topic: "reporting",
    question: "गुमनाम शिकायत और शिकायत करके ट्रैक करने में क्या अंतर है?",
    answer:
      "शिकायत करें और ट्रैक करें से आपको एक पावती नंबर मिलता है ताकि आप बाद में प्रगति देख सकें। गुमनाम शिकायत में आपकी पहचान नहीं होती, लेकिन आप उस विशेष शिकायत को ट्रैक नहीं कर पाएँगे।",
  },
  {
    id: "what-evidence",
    topic: "evidence",
    question: "मुझे कौन सा साक्ष्य सुरक्षित रखना चाहिए?",
    answer:
      "संदेशों के स्क्रीनशॉट, लेन-देन संदर्भ, भेजने वाले का फ़ोन नंबर या ईमेल, और कोई भी कॉल रिकॉर्डिंग सुरक्षित रखें। मूल संदेश या ईमेल न हटाएँ।",
  },
  {
    id: "evidence-after-filing",
    topic: "evidence",
    question: "क्या मैं शिकायत दर्ज करने के बाद साक्ष्य जोड़ सकता हूँ?",
    answer:
      "हाँ। पावती नंबर का उपयोग करके अपने मामले को संभालने वाली साइबर सेल से संपर्क करें, या संपर्क पृष्ठ से अपने राज्य/केंद्रशासित प्रदेश के अधिकारी तक पहुँचें।",
  },
  {
    id: "otp-not-received",
    topic: "account",
    question: "मुझे OTP नहीं मिला। मैं क्या करूँ?",
    answer:
      "एक मिनट प्रतीक्षा करें और दोबारा भेजने का विकल्प इस्तेमाल करें। फिर भी न मिले तो जाँचें कि आपकी शिकायत से जुड़ा मोबाइल नंबर सही है, या अपने राज्य की साइबर सेल से संपर्क करें।",
  },
  {
    id: "otp-purpose",
    topic: "account",
    question: "शिकायत ट्रैक करने के लिए OTP क्यों ज़रूरी है?",
    answer:
      "OTP यह पुष्टि करता है कि स्थिति जाँचने वाला व्यक्ति वही है जिसने शिकायत दर्ज की थी, जिससे आपकी शिकायत का विवरण किसी और से सुरक्षित रहता है जिसके पास आपका पावती नंबर हो सकता है।",
  },
  {
    id: "how-to-track",
    topic: "tracking",
    question: "मैं अपनी शिकायत कैसे ट्रैक करूँ?",
    answer:
      "शिकायत ट्रैक करें पर जाएँ, अपना पावती नंबर दर्ज करें, फिर अपने पंजीकृत मोबाइल नंबर पर भेजे गए OTP से सत्यापित करें।",
  },
  {
    id: "no-ack-number",
    topic: "tracking",
    question: "मेरा पावती नंबर खो गया है। क्या मैं फिर भी शिकायत ट्रैक कर सकता हूँ?",
    answer:
      "संपर्क पृष्ठ से सीधे अपने राज्य/केंद्रशासित प्रदेश की साइबर सेल से संपर्क करें — वे आपकी अन्य जानकारी से आपकी शिकायत खोज सकते हैं।",
  },
  {
    id: "how-to-withdraw",
    topic: "withdrawal",
    question: "क्या मैं दर्ज की गई शिकायत वापस ले सकता हूँ?",
    answer:
      "सीधे अपने मामले को संभालने वाली साइबर सेल से संपर्क करें। वापसी की प्रक्रिया जाँच अधिकारी द्वारा संभाली जाती है, इस वेबसाइट के माध्यम से नहीं।",
  },
  {
    id: "false-complaint",
    topic: "withdrawal",
    question: "अगर मैंने गलती से शिकायत दर्ज कर दी तो क्या होगा?",
    answer:
      "जितनी जल्दी हो सके अपने पावती नंबर का उपयोग करके अपने मामले को संभालने वाली साइबर सेल से संपर्क करें ताकि रिकॉर्ड को ठीक या बंद किया जा सके।",
  },
  {
    id: "avoid-scams",
    topic: "safety",
    question: "मैं दोबारा उसी ठगी का शिकार होने से कैसे बचूँ?",
    answer:
      "सरकारी अधिकारी कभी भी फ़ोन या ईमेल पर OTP, पासवर्ड, या अग्रिम भुगतान नहीं माँगते। किसी भी अप्रत्याशित अनुरोध की पुष्टि खुद खोजी गई जानकारी से संगठन से सीधे संपर्क करके करें।",
  },
  {
    id: "fake-officials",
    topic: "safety",
    question: "साइबर सेल होने का दावा करने वाला फ़र्ज़ी ईमेल कैसे पहचानें?",
    answer:
      "भेजने वाले के ईमेल डोमेन को ध्यान से जाँचें, और याद रखें कि वास्तविक अधिकारी कभी भी ईमेल या फ़ोन पर पैसे या OTP नहीं माँगेंगे।",
  },
];

export function getFaqEntries(locale: string): FaqEntry[] {
  return locale === "hi" ? hi : en;
}
