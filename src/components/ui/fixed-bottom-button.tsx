"use client";

import { Button } from "@/components/ui/button";

interface FixedBottomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function FixedBottomButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: FixedBottomButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/20 backdrop-blur-sm z-50">
      <Button
        className={`h-14 my-4 mx-6 w-[calc(100%-3rem)] text-xl font-semibold ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </div>
  );
}
