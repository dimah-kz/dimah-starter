import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithIntl } from "@/test/render"
import { ListSearch } from "./list-search"

const DEBOUNCE_MS = 300

function setup(value?: string) {
  const onCommit = vi.fn<(q: string | undefined) => void>()
  const user = userEvent.setup({
    advanceTimers: (ms) => vi.advanceTimersByTime(ms),
  })
  const view = renderWithIntl(<ListSearch value={value} onCommit={onCommit} />)
  const rerender = (next?: string) =>
    view.rerender(<ListSearch value={next} onCommit={onCommit} />)

  return { onCommit, user, rerender, input: screen.getByRole("searchbox") }
}

const settle = () => act(() => vi.advanceTimersByTime(DEBOUNCE_MS))

describe("ListSearch", () => {
  // The debounce runs on fake time; `shouldAdvanceTime` keeps the event loop
  // moving for user-event and React.
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("commits the trimmed query once typing pauses", async () => {
    const { onCommit, user, input } = setup()

    await user.type(input, "ada ")
    expect(onCommit).not.toHaveBeenCalled()
    await settle()

    expect(onCommit).toHaveBeenCalledExactlyOnceWith("ada")
  })

  it("waits for the minimum length", async () => {
    const { onCommit, user, input } = setup()

    await user.type(input, "a")
    await settle()

    expect(onCommit).not.toHaveBeenCalled()
  })

  it("keeps what is being typed when its own query comes back", async () => {
    const { user, input, rerender } = setup()

    await user.type(input, "ada ")
    await settle()
    await user.type(input, "l")
    rerender("ada")

    expect(input).toHaveValue("ada l")
  })

  it("shows a query that changed elsewhere, such as the back button", () => {
    const { input, rerender } = setup("ada")

    rerender("grace")

    expect(input).toHaveValue("grace")
  })

  it("commits on Enter without waiting", async () => {
    const { onCommit, user, input } = setup()

    await user.type(input, "grace{Enter}")

    expect(onCommit).toHaveBeenCalledExactlyOnceWith("grace")
  })

  it("clears the query once", async () => {
    const { onCommit, user, input } = setup("ada")

    await user.click(screen.getByRole("button", { name: "Clear search" }))
    await settle()

    expect(input).toHaveValue("")
    expect(onCommit).toHaveBeenCalledExactlyOnceWith(undefined)
  })
})
