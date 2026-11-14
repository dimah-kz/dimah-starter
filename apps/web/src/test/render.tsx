import { render, type RenderOptions } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactElement } from "react"
import { loadMessages, type Locale } from "@repo/i18n"

/**
 * Renders a Client Component with the real message catalog, as the root
 * layout does, so `useTranslations` returns the shipped copy.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "en", ...options }: RenderOptions & { locale?: Locale } = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider
        locale={locale}
        messages={loadMessages(locale)}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  })
}
