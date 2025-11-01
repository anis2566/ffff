import { LucideIcon } from "lucide-react";

import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";

interface ListActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  isDanger?: boolean;
  hasPermission?: boolean;
  className?: string;
}

export const ListActionButton = ({
  icon: Icon,
  onClick,
  title,
  isDanger = false,
  hasPermission = true,
  className,
}: ListActionButtonProps) => {
  if (!hasPermission) return null;

  return (
    <>
      {isDanger && <Separator />}
      <DropdownMenuItem
        className={cn(
          "flex items-center gap-x-3 rounded-[0px] h-7",
          isDanger && "text-rose-500 group-hover:text-rose-600",
          className
        )}
        onClick={onClick}
      >
        <Icon
          className={cn(
            "",
            isDanger && "text-rose-500 group-hover:text-rose-600"
          )}
        />
        <p
          className={cn(
            "",
            isDanger && "text-rose-500 group-hover:text-rose-600"
          )}
        >
          {title}
        </p>
      </DropdownMenuItem>
    </>
  );
};
