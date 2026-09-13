"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/components/sidebar"
import { useSidebarSide } from "@/app/dashboard/components/sidebar/sidebar-side"
import { Skeleton } from "@repo/ui/components/skeleton"

function SidebarRowSkeleton({ lines = 1 }: { lines?: 1 | 2 }) {
  return (
    <div className="flex h-8 items-center gap-2 rounded-md px-2">
      <Skeleton className="size-4 shrink-0 rounded-sm" />
      <div className="grid min-w-0 flex-1 gap-1">
        <Skeleton className="h-3.5 w-[70%] max-w-full rounded-sm" />
        {lines === 2 ? (
          <Skeleton className="h-3 w-1/2 max-w-full rounded-sm" />
        ) : null}
      </div>
    </div>
  )
}

export function DashboardSidebarFallback() {
  const side = useSidebarSide()

  return (
    <Sidebar side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarRowSkeleton lines={2} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {Array.from({ length: 3 }, (_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarRowSkeleton />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarRowSkeleton lines={2} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
