import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const first = Array.from(parts[0] ?? "")[0]
  if (!first) return "?"
  if (parts.length === 1) return first.toUpperCase()

  const last = Array.from(parts[parts.length - 1] ?? "")[0]
  return `${first}${last ?? ""}`.toUpperCase()
}

const identityVariants = cva(
  "group/identity flex w-full min-w-0 items-center",
  {
    variants: {
      size: {
        sm: "gap-1.5",
        default: "gap-2.5",
        lg: "gap-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type IdentitySize = NonNullable<VariantProps<typeof identityVariants>["size"]>

const IdentityContext = React.createContext<IdentitySize>("default")

interface IdentityProps
  extends
    useRender.ComponentProps<"div">,
    VariantProps<typeof identityVariants> {}

function Identity({
  className,
  size = "default",
  render,
  ...props
}: IdentityProps) {
  const resolvedSize = size ?? "default"

  return (
    <IdentityContext.Provider value={resolvedSize}>
      {useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(
          {
            className: cn(identityVariants({ size: resolvedSize, className })),
          },
          props
        ),
        render,
        state: {
          slot: "identity",
          size: resolvedSize,
        },
      })}
    </IdentityContext.Provider>
  )
}

function IdentityAvatar({
  className,
  size,
  src,
  name,
  alt,
  children,
  ...props
}: React.ComponentProps<typeof Avatar> & {
  src?: string | null
  name?: string
  alt?: string
}) {
  const identitySize = React.useContext(IdentityContext)

  return (
    <Avatar size={size ?? identitySize} className={className} {...props}>
      {children ?? (
        <>
          {src ? <AvatarImage src={src} alt={alt ?? name ?? ""} /> : null}
          <AvatarFallback>{getInitials(name ?? alt ?? "")}</AvatarFallback>
        </>
      )}
    </Avatar>
  )
}

function IdentityContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex max-w-full min-w-0 flex-1 flex-col gap-0.5 overflow-hidden group-data-[size=sm]/identity:gap-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "identity-content",
    },
  })
}

function IdentityAddon({
  className,
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "inline-flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 group-data-[size=lg]/identity:[&_svg:not([class*='size-'])]:size-4 group-data-[size=sm]/identity:[&_svg:not([class*='size-'])]:size-3",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "identity-addon",
    },
  })
}

function isIdentityAddon(
  node: React.ReactNode
): node is React.ReactElement<React.ComponentProps<typeof IdentityAddon>> {
  return React.isValidElement(node) && node.type === IdentityAddon
}

function lineLabel(children: React.ReactNode) {
  const parts: string[] = []
  React.Children.forEach(children, (node) => {
    if (typeof node !== "string" && typeof node !== "number") return
    const text = String(node).trim()
    if (text) parts.push(text)
  })
  return parts.length > 0 ? parts.join(" ") : undefined
}

// An addon stays visible beside the label. Plain text truncates on the line.
function splitLine(children: React.ReactNode) {
  const nodes = React.Children.toArray(children)
  if (!nodes.some(isIdentityAddon)) {
    return { hasAddon: false as const, children }
  }

  const result: React.ReactNode[] = []
  let label: React.ReactNode[] = []
  let labelIndex = 0

  const flushLabel = () => {
    if (label.length === 0) return
    result.push(
      <span key={`label-${labelIndex}`} className="min-w-0 truncate">
        {label}
      </span>
    )
    labelIndex += 1
    label = []
  }

  for (const node of nodes) {
    if (isIdentityAddon(node)) {
      flushLabel()
      result.push(node)
      continue
    }
    label.push(node)
  }
  flushLabel()

  return { hasAddon: true as const, children: result }
}

function IdentityLine({
  lineSlot,
  className,
  children,
  title,
  render,
  ...props
}: useRender.ComponentProps<"span"> & {
  lineSlot: "identity-title" | "identity-description"
}) {
  const line = splitLine(children)

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "max-w-full min-w-0 text-start",
          line.hasAddon
            ? "flex w-full items-center gap-1 group-data-[size=sm]/identity:gap-0.5"
            : "block w-full truncate",
          className
        ),
        title: title ?? lineLabel(children),
        children: line.children,
      },
      props
    ),
    render,
    state: {
      slot: lineSlot,
    },
  })
}

function IdentityTitle({
  className,
  ...props
}: useRender.ComponentProps<"span">) {
  return (
    <IdentityLine
      lineSlot="identity-title"
      className={cn(
        "text-sm/tight font-medium group-data-[size=lg]/identity:text-base/tight group-data-[size=sm]/identity:text-xs/tight",
        className
      )}
      {...props}
    />
  )
}

function IdentityDescription({
  className,
  ...props
}: useRender.ComponentProps<"span">) {
  return (
    <IdentityLine
      lineSlot="identity-description"
      className={cn("text-xs/tight text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityTitle,
  IdentityDescription,
  IdentityAddon,
  identityVariants,
}
export type { IdentityProps }
