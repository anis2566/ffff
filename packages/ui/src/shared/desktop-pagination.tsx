"use client";

import { useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "../components/pagination";
import { Button } from "../components/button";
import { cn } from "../lib/utils";

export interface DesktopPaginationProps {
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

const PageButton = ({
  page,
  isActive,
  onClick,
  className,
}: {
  page: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <PaginationItem>
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn("rounded-full h-7 w-7", isActive && "mx-2", className)}
      onClick={onClick}
    >
      {page}
    </Button>
  </PaginationItem>
);

export function DesktopPagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  maxVisiblePages = 5,
  className,
  showWhenEmpty = false,
  paginationClassName = "w-[93%] py-1",
}: DesktopPaginationProps) {
  const totalPageCount = useMemo(
    () => Math.ceil(totalCount / pageSize),
    [totalCount, pageSize]
  );

  const handlePageClick = useCallback(
    (page: number) => () => onPageChange(page),
    [onPageChange]
  );

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPageCount) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPageCount, onPageChange]);

  const pageNumbers = useMemo(() => {
    if (totalPageCount <= maxVisiblePages) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPageCount - 1, currentPage + 1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPageCount - 2) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPageCount);

    return pages;
  }, [totalPageCount, maxVisiblePages, currentPage]);

  if (totalPageCount === 0 || (!showWhenEmpty && totalCount === 0)) {
    return null;
  }

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
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
          </PaginationItem>

          {pageNumbers.map((page) =>
            typeof page === "number" ? (
              <PageButton
                key={page}
                page={page}
                isActive={currentPage === page}
                onClick={handlePageClick(page)}
                className={page === totalPageCount ? "mr-2" : undefined}
              />
            ) : (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <Button
              disabled={currentPage === totalPageCount}
              variant="outline"
              size="icon"
              className="ml-1 h-7 w-7"
              onClick={handleNext}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
