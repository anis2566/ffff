"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";

export const SidebarBreadcrumb = () => {
  const pathname = usePathname();

  const pathnameArray = pathname.split("/").slice(1);

  const isDashboardRoute = pathnameArray.length === 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isDashboardRoute ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize text-white">
              {pathnameArray[0]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          pathnameArray.map((path, index, array) => {
            const href = `/${array.slice(0, index + 1).join("/")}`;
            const isLast = index === array.length - 1;

            return (
              <div key={index} className="flex items-center text-white">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize text-white/60">
                      {path}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>
                        <span className="capitalize text-white">{path}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
