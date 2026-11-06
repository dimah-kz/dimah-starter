/** Landing section ids — the page anchors and the header/footer links share these. */
export const marketingSections = {
  features: "features",
  quickStart: "quick-start",
} as const

export const marketingRoutes = {
  home: () => "/",
  features: () => `/#${marketingSections.features}`,
  quickStart: () => `/#${marketingSections.quickStart}`,
} as const
