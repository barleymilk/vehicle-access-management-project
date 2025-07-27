"use client";

import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorDisplay({
  title = "Oops!",
  message,
  onRetry,
  retryText = "다시 시도",
  className = "",
}: ErrorDisplayProps) {
  return (
    <div
      className={`h-64 bg-[var(--muted)] mt-6 rounded-lg p-6 text-center ${className}`}
    >
      <CircleX className="w-12 h-12 text-red-500 m-auto mb-4" />
      <p className="text-3xl font-semibold mb-4">{title}</p>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      {onRetry && (
        <Button className="rounded-full" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
}
