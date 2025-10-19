import Image from "next/image";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

export const Header = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="" asChild>
          <Link href="/" prefetch>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="size-6"
              />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate text-md font-bold">
                Basic Education Care
              </span>
              <span className="truncate text-xs">Admin</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
