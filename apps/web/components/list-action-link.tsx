import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";

interface ListActionButtonProps {
  href: string;
  icon: LucideIcon;
  title: string;
}

export const ListActionLink = ({
  href,
  icon: Icon,
  title,
}: ListActionButtonProps) => {
  return (
    <DropdownMenuItem
      className="flex items-center gap-x-3 rounded-[0px] h-7"
      asChild
    >
      <Link href={href || "/"} className="flex items-center gap-x-3" prefetch>
        <Icon />
        <p>{title}</p>
      </Link>
    </DropdownMenuItem>
  );
};
