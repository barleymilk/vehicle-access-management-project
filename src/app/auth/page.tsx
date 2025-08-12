"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "login" ? "로그인" : "회원가입"}
            </h1>
            <p className="text-gray-600 mt-2">
              {mode === "login" ? "계정에 로그인하세요" : "새 계정을 만드세요"}
            </p>
          </div>

          {mode === "login" ? (
            <LoginForm
              onSwitchToSignup={() => setMode("signup")}
              onForgotPassword={() => {
                // TODO: 비밀번호 재설정 페이지 구현
                alert("비밀번호 재설정 기능은 준비 중입니다.");
              }}
            />
          ) : (
            <SignupForm onSwitchToLogin={() => setMode("login")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
