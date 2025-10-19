import { MoreVerticalIcon } from "lucide-react";

import { Button } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";

interface ListActionsProps {
  children: React.ReactNode;
}

export const ListActions = ({ children }: ListActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gray-700 hover:text-white h-8 w-8"
        >
          <MoreVerticalIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xs">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
