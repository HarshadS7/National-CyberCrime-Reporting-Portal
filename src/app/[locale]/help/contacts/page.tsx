import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Alert } from "@/components/ui/Alert";
import { getStateContacts } from "@/lib/api/client";
import { ContactsExplorer } from "./ContactsExplorer";

export default function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const contacts = use(getStateContacts());

  const t = useTranslations("contacts");

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("intro")}</p>
      </div>

      <Alert tone="warning" title={t("demoNoteTitle")}>
        {t("demoNote")}
      </Alert>

      <ContactsExplorer contacts={contacts} />

      <p className="text-sm text-ink-muted">{t("escalationNote")}</p>
    </div>
  );
}
