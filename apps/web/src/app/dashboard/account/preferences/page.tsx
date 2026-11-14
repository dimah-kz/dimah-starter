import { AccountLanguageCard } from "@/app/dashboard/account/preferences/components/account-language-card"
import { AccountThemeCard } from "@/app/dashboard/account/preferences/components/account-theme-card"
import { locales } from "@repo/i18n"

/** Browser preferences only: no private data to gate. */
export default function AccountPreferencesPage() {
  return (
    <div className="flex flex-col gap-6">
      <AccountThemeCard />
      {locales.length > 1 ? <AccountLanguageCard /> : null}
    </div>
  )
}
