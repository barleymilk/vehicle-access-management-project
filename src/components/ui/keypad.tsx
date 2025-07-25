"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FixedBottomButton } from "@/components/ui/fixed-bottom-button";
import { X, Delete } from "lucide-react";
import { useState } from "react";

interface KeypadProps {
  onSearch: (value: string) => void;
}

export function Keypad({ onSearch }: KeypadProps) {
  const [input, setInput] = useState("");

  const handleInput = (value: number) => {
    // 입력값이 4자리 미만일 때만 추가
    if (input.length < 4) {
      setInput(input + value.toString());
    }
  };

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="relative w-full">
          <Input
            type="text"
            value={input}
            placeholder="차량 번호 입력"
            className="my-8 h-12 rounded-full pr-12 pl-5"
            readOnly
          />
          <Button
            variant="ghost"
            className="absolute right-2 top-0 my-8 h-12 rounded-full"
            onClick={handleClear}
          >
            <X />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 my-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            className="h-14 text-2xl transition-colors active:bg-primary/90 active:scale-95"
            onClick={() => handleInput(num)}
          >
            {num}
          </Button>
        ))}
        <Button
          className="h-14 text-lg font-bold transition-colors active:bg-primary/90 active:scale-95"
          onClick={() => onSearch("기타")}
        >
          기타
        </Button>
        <Button
          className="h-14 text-2xl transition-colors active:bg-primary/90 active:scale-95"
          onClick={() => handleInput(0)}
        >
          0
        </Button>
        <Button
          className="h-14 text-2xl transition-colors active:bg-primary/90 active:scale-95"
          onClick={handleDelete}
        >
          <Delete strokeWidth={1.5} className="scale-190" />
        </Button>
      </div>

      {/* 검색 버튼 */}
      <FixedBottomButton onClick={() => onSearch(input)}>
        검색하기
      </FixedBottomButton>
    </>
  );
}
