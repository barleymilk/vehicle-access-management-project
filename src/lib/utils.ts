import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 전화번호를 하이픈이 포함된 형태로 포맷팅합니다.
 * @param phone - 포맷팅할 전화번호
 * @returns 포맷팅된 전화번호 (예: 010-1234-5678)
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  // 숫자만 추출 (혹시라도 DB에 공백/문자 있을 때 대비)
  phone = phone.replace(/\D/g, "");
  if (phone.length === 11)
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  if (phone.length === 10)
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  return phone; // 10, 11자리가 아니면 그냥 반환
}
