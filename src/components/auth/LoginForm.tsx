"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types/auth";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
}: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      return;
    }

    setIsLoading(true);
    try {
      await login(credentials);
    } catch (error) {
      console.error("로그인 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <InputField
          id="email"
          label="이메일"
          type="email"
          value={credentials.email}
          onChange={(value) =>
            setCredentials((prev) => ({ ...prev, email: value }))
          }
          placeholder="이메일을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <InputField
          id="password"
          label="비밀번호"
          type="password"
          value={credentials.password}
          onChange={(value) =>
            setCredentials((prev) => ({ ...prev, password: value }))
          }
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !credentials.email || !credentials.password}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          비밀번호를 잊으셨나요?
        </button>

        <div className="text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            회원가입
          </button>
        </div>
      </div>
    </form>
  );
}
