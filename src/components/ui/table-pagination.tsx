"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: TablePaginationProps) {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 페이지가 1개 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        className="rounded-full"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </Button>
      <span className="text-sm">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        className="rounded-full"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
