import Image from "next/image";

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

interface HeaderProps {
  title: string;
  description: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <CardHeader className="px-0">
      <div className="w-[65px] h-[65px] flex items-center justify-center rounded-full border-2 border-muted backdrop-blur-md mx-auto">
        <Image
          src="/logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="mx-auto w-[60px] h-[60px] object-contain"
        />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <Separator className="mb-3" />
    </CardHeader>
  );
};
