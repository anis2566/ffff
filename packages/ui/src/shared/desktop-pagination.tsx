"use client";

import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "../components/pagination";
import { Button } from "../components/button";

import { cn } from "../lib/utils";

export interface MobilePaginationProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
  showWhenEmpty?: boolean;
  activeClassName?: string;
  paginationClassName?: string;
}

export function DesktopPagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  maxVisiblePages = 5,
  className,
  showWhenEmpty = false,
  paginationClassName = "w-[93%] py-1",
}: MobilePaginationProps) {
  const totalPageCount = Math.ceil(totalCount / pageSize);

  if (totalPageCount === 0 || (!showWhenEmpty && totalCount === 0)) {
    return null;
  }

  const renderPageNumbers = () => {
    const items: ReactNode[] = [];

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <Button
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full h-7 w-7",
                currentPage === i && "mx-2"
              )}
              onClick={() => onPageChange(i)}
            >
              {i}
            </Button>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            className={cn("rounded-full h-7 w-7", currentPage === 1 && "mx-2")}
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPageCount - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <Button
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full h-7 w-7",
                currentPage === i && "mx-2"
              )}
              onClick={() => onPageChange(i)}
            >
              {i}
            </Button>
          </PaginationItem>
        );
      }

      if (currentPage < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPageCount}>
          <Button
            variant={currentPage === totalPageCount ? "default" : "outline"}
            size="sm"
            className={cn("rounded-full h-7 w-7 mr-2")}
            onClick={() => onPageChange(totalPageCount)}
          >
            {totalPageCount}
          </Button>
        </PaginationItem>
      );
    }

    return items;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPageCount) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={cn(
        "hidden md:flex flex-col md:flex-row items-center gap-3 w-full",
        className
      )}
    >
      <Pagination className={paginationClassName}>
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <Button
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className="mr-1 h-7 w-7"
              onClick={handlePrevious}
            >
              <ChevronLeft />
            </Button>
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <Button
              disabled={currentPage === totalPageCount}
              variant="outline"
              size="icon"
              className="ml-1 h-7 w-7"
              onClick={handleNext}
            >
              <ChevronRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
