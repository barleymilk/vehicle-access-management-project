"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/AuthContext";
import { SignupCredentials } from "@/types/auth";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { signup, error } = useAuth();

  const validateForm = () => {
    if (credentials.password !== confirmPassword) {
      setValidationError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (credentials.password.length < 6) {
      setValidationError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signup(credentials);
    } catch (error) {
      console.error("회원가입 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <InputField
          id="name"
          label="이름"
          value={credentials.name}
          onChange={(value) =>
            setCredentials((prev) => ({ ...prev, name: value }))
          }
          placeholder="이름을 입력하세요"
          required
        />
      </div>

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
          placeholder="비밀번호를 입력하세요 (최소 6자)"
          required
        />
      </div>

      <div className="space-y-2">
        <InputField
          id="confirmPassword"
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setCredentials((prev) => ({ ...prev, confirmPassword: value }));
          }}
          placeholder="비밀번호를 다시 입력하세요"
          required
        />
      </div>

      {(error || validationError) && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {validationError || error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          isLoading ||
          !credentials.email ||
          !credentials.password ||
          !credentials.name ||
          !confirmPassword
        }
      >
        {isLoading ? "회원가입 중..." : "회원가입"}
      </Button>

      <div className="text-center">
        <div className="text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            로그인
          </button>
        </div>
      </div>
    </form>
  );
}
