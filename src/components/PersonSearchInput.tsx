import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Driver } from "@/types";
import { usePeopleSearch } from "@/hooks/useSupabase";
import { X } from "lucide-react";

interface PersonSearchInputProps {
  onSelectPerson: (person: Driver) => void;
  placeholder?: string;
  className?: string;
}

export default function PersonSearchInput({
  onSelectPerson,
  placeholder = "검색",
  className = "",
}: PersonSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 디바운싱을 위한 타이머
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // 디바운싱 적용
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // 훅을 사용한 검색
  const {
    data: searchResults = [],
    loading: isLoading,
    error,
  } = usePeopleSearch(
    debouncedSearchTerm,
    debouncedSearchTerm.trim().length > 0
  );

  // 검색 결과가 변경될 때 드롭다운 상태 업데이트
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else if (debouncedSearchTerm.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchResults, debouncedSearchTerm]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !searchResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectPerson(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectPerson = (person: Driver) => {
    onSelectPerson(person);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getStatusTags = (person: Driver) => {
    const tags = [];
    if (person.vip_level && person.vip_level !== "none") {
      tags.push(`(${person.vip_level})`);
    }
    if (person.status) {
      switch (person.status) {
        case "active":
          tags.push("활성");
          break;
        case "inactive":
          tags.push("비활성");
          break;
        case "blocked":
          tags.push("차단");
          break;
      }
    }
    return tags.join(" ");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0) {
                setIsOpen(true);
              }
            }}
            className="pr-8"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="button" disabled={!searchTerm.trim()}>
          추가
        </Button>
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">검색 중...</div>
          ) : error ? (
            <div className="p-3 text-center text-red-500">
              검색 중 오류가 발생했습니다.
            </div>
          ) : !searchResults || searchResults.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            searchResults.map((person, index) => (
              <div
                key={person.id}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                  index === selectedIndex ? "bg-blue-50" : ""
                }`}
                onClick={() => handleSelectPerson(person)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{person.name}</span>
                      <span className="text-xs text-gray-500">
                        {getStatusTags(person)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {person.org_dept_pos ? person.org_dept_pos : "소속 없음"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {person.phone_number}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
