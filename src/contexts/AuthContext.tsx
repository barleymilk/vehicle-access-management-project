"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  User,
} from "@/types/auth";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
} from "@/lib/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 초기 세션 로드
    const loadInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const user = session.user;
          setState((prev) => ({
            ...prev,
            user: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            session,
            loading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("초기 세션 로드 실패:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    loadInitialSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = session.user;
        setState({
          user: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          session,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signInWithEmail(credentials);
      // 로그인 성공 시 메인 페이지로 리다이렉트
      router.push("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "로그인에 실패했습니다.";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signUpWithEmail(credentials);
      // 회원가입 성공 시 메인 페이지로 리다이렉트
      router.push("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "회원가입에 실패했습니다.";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await signOut();
      // 로그아웃 시 인증 페이지로 리다이렉트
      router.push("/auth");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "로그아웃에 실패했습니다.";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const resetPasswordHandler = async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await resetPassword(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "비밀번호 재설정에 실패했습니다.";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    resetPassword: resetPasswordHandler,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내에서 사용되어야 합니다.");
  }
  return context;
}
