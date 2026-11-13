"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@repo/ui/components/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group"
import {
  LIST_SEARCH_MAX_LENGTH,
  LIST_SEARCH_MIN_LENGTH,
} from "@/components/list/types"

const DEBOUNCE_MS = 300

type ListSearchProps = {
  value?: string
  placeholder?: string
  onCommit: (q: string | undefined) => void
}

function commitSearch(
  draft: string,
  normalizedValue: string,
  onCommit: (q: string | undefined) => void
) {
  const trimmed = draft.trim()

  if (trimmed === normalizedValue) {
    return
  }

  if (trimmed.length > 0 && trimmed.length < LIST_SEARCH_MIN_LENGTH) {
    return
  }

  const nextValue =
    trimmed.length >= LIST_SEARCH_MIN_LENGTH ? trimmed : undefined

  if (nextValue === normalizedValue || (!nextValue && !normalizedValue)) {
    return
  }

  onCommit(nextValue)
}

export function ListSearch({ value, placeholder, onCommit }: ListSearchProps) {
  const t = useTranslations("common")
  const searchPlaceholder = placeholder ?? t("search")
  const [draft, setDraft] = useState(value ?? "")
  const [syncedValue, setSyncedValue] = useState(value)
  // Last query this input sent, or the URL's when that changed from outside.
  const [committed, setCommitted] = useState(value)
  const timeoutRef = useRef<number>(undefined)
  const normalizedCommitted = committed?.trim() ?? ""

  if (value !== syncedValue) {
    setSyncedValue(value)
    setCommitted(value)
    // Our own commit coming back keeps the draft (a trailing space, keys typed
    // while the page loaded). Back button or a reset elsewhere replaces it.
    if (value !== committed) {
      setDraft(value ?? "")
    }
  }

  const commit = (q: string | undefined) => {
    setCommitted(q)
    onCommit(q)
  }

  const commitDraft = useEffectEvent((nextDraft: string) => {
    commitSearch(nextDraft, normalizedCommitted, commit)
  })

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      commitDraft(draft)
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutRef.current)
  }, [draft])

  const handleClear = () => {
    window.clearTimeout(timeoutRef.current)
    setDraft("")
    if (normalizedCommitted) {
      commit(undefined)
    }
  }

  return (
    <InputGroup data-slot="list-search" className="w-full min-w-0 sm:max-w-xs">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        maxLength={LIST_SEARCH_MAX_LENGTH}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return
          }
          event.preventDefault()
          window.clearTimeout(timeoutRef.current)
          commitSearch(draft, normalizedCommitted, commit)
        }}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {draft.length > 0 ? (
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={t("clearSearch")}
            onClick={handleClear}
          >
            <XIcon />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
