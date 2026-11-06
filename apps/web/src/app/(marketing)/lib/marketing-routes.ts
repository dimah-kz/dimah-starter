/** Landing section ids — the page anchors and the header/footer links share these. */
export const marketingSections = {
  features: "features",
  nextjs: "nextjs",
  quickStart: "quick-start",
  faq: "faq",
} as const

export const marketingRoutes = {
  home: () => "/",
  features: () => `/#${marketingSections.features}`,
  quickStart: () => `/#${marketingSections.quickStart}`,
  faq: () => `/#${marketingSections.faq}`,
} as const
