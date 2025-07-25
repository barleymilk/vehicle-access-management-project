"use client";

import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const { username, isLoggedIn, login, logout } = useUserStore();
  const handleLogin = () => {
    login("TestUser");
  };
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isLoggedIn ? (
        <Button onClick={handleLogout}>{username}님 로그아웃</Button>
      ) : (
        <Button onClick={handleLogin}>로그인</Button>
      )}
    </div>
  );
}
