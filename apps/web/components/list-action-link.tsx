import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";

interface ListActionButtonProps {
  href: string;
  icon: LucideIcon;
  title: string;
  hasPermission?: boolean;
  className?: string;
}

export const ListActionLink = ({
  href,
  icon: Icon,
  title,
  hasPermission = true,
  className
}: ListActionButtonProps) => {
  if (!hasPermission) return null;
  return (
    <DropdownMenuItem
      className={cn("flex items-center gap-x-3 rounded-[0px] h-7", className)}
      asChild
    >
      <Link href={href || "/"} className="flex items-center gap-x-3" prefetch>
        <Icon />
        <p>{title}</p>
      </Link>
    </DropdownMenuItem>
  );
};
