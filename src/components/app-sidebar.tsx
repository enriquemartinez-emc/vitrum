"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FileTextIcon, ShoppingCartIcon, CameraIcon, Settings2Icon, PackageIcon, TagIcon, CommandIcon, LayoutDashboardIcon } from "lucide-react"

const data = {
  user: {
    name: "admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navTop: {
    title: "Dashboard",
    url: "/dashboard",
    icon: (
      <LayoutDashboardIcon
      />
    ),
  },
  navMain: [
    {
      title: "Sales",
      icon: (
        <ShoppingCartIcon
        />
      ),
      items: [
        {
          title: "Quotes",
          url: "/dashboard/quotes",
        },
        {
          title: "Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Customers",
          url: "/dashboard/customers",
        },
      ],
    },
    {
      title: "Products",
      icon: (
        <TagIcon
        />
      ),
      items: [
        {
          title: "Window Types",
          url: "/dashboard/products/window-types",
        },
        {
          title: "Glass Types",
          url: "/dashboard/products/glass-types",
        },
      ],
    },
    {
      title: "Inventory",
      icon: (
        <PackageIcon
        />
      ),
      items: [
        {
          title: "Register Shipment",
          url: "/dashboard/inventory",
        },
      ],
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Vitrum</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain topLink={data.navTop} items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
