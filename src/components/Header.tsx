"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ArrowLeft, House, LogOut, User } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  back?: boolean;
  title?: string;
  onBack?: () => void;
  onHomeClick?: () => void;
}

export default function Header({
  back = false,
  title = "타이틀",
  onBack = () => {},
  onHomeClick,
}: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header
      className="bg-background sticky top-0 z-50 border-b"
      style={{ height: "var(--header-height)" }}
    >
      <Sheet>
        <div className="flex items-center justify-between px-4 py-3">
          {/* 왼쪽: 메뉴 or 뒤로가기 아이콘 */}
          {back ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onBack()}
                  aria-label="뒤로가기"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (onHomeClick) {
                      onHomeClick();
                    } else {
                      router.push("/");
                    }
                  }}
                  aria-label="홈으로 이동"
                >
                  <House className="w-8 h-8" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (onHomeClick) {
                    onHomeClick();
                  } else {
                    router.push("/");
                  }
                }}
                aria-label="홈으로 이동"
              >
                <House className="w-8 h-8" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          )}

          {/* 가운데: 페이지 제목 */}
          <h1 className="text-md font-semibold absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            {/* 사용자 정보 및 로그아웃 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {user?.name || user?.email || "사용자"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 h-8 px-2"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 사이드 메뉴 */}
        {!back && (
          <SheetContent side="left" className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
                <SheetDescription className="sr-only">
                  메뉴를 고르세요
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-6 py-2">
                <SheetClose asChild>
                  <Button
                    className="h-12 font-semibold"
                    onClick={() => handleNavigation("/")}
                  >
                    차량 번호 검색
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="h-12 font-semibold"
                    onClick={() => handleNavigation("/access")}
                  >
                    출입 기록 DB
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="h-12 font-semibold"
                    onClick={() => handleNavigation("/vehicles")}
                  >
                    차량 DB
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    className="h-12 font-semibold"
                    onClick={() => handleNavigation("/people")}
                  >
                    사람 DB
                  </Button>
                </SheetClose>
              </div>
            </div>
            <SheetFooter className="p-4 border-t">
              <SheetClose asChild>
                <Button variant="outline" className="w-full h-12">
                  닫기
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        )}
      </Sheet>
    </header>
  );
}
