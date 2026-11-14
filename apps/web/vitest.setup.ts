import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Testing Library unmounts after each test by itself only with `globals: true`.
afterEach(() => {
  cleanup()
})
