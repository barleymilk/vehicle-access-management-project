import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  // 전화번호 형식 변환 (예: 01012345678 -> 010-1234-5678)
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return phone;
}

export function validatePlateNumber(plateNumber: string): {
  isValid: boolean;
  message: string;
} {
  const cleaned = plateNumber.replace(/\s/g, "").toUpperCase();

  // '기타' 문자열은 특별히 허용
  if (cleaned === "기타") {
    return { isValid: true, message: "" };
  }

  // 한국 차량번호 형식 패턴들
  const patterns = [
    // 4자리 숫자: 1234
    /^\d{4}$/,
    // 일반 차량: 12가3456, 123가4567
    /^\d{2,3}[가-힣]\d{4}$/,
    // 특수 차량: 12가3456, 123가4567 (특수문자 포함)
    /^\d{2,3}[가-힣]\d{4}$/,
    // 외교 차량: 12가3456
    /^\d{2}[가-힣]\d{4}$/,
    // 군용 차량: 12가3456
    /^\d{2}[가-힣]\d{4}$/,
    // 임시 차량: 12가3456
    /^\d{2}[가-힣]\d{4}$/,
  ];

  // 빈 값 체크
  if (!cleaned.trim()) {
    return { isValid: false, message: "차량번호를 입력해주세요." };
  }

  // 길이 체크 (최소 4자, 최대 8자)
  if (cleaned.length < 4 || cleaned.length > 8) {
    return { isValid: false, message: "차량번호는 4-8자리여야 합니다." };
  }

  // 패턴 매칭
  const isValidFormat = patterns.some((pattern) => pattern.test(cleaned));
  if (!isValidFormat) {
    return {
      isValid: false,
      message: "올바른 차량번호 형식이 아닙니다. (예: 1234, 12가3456)",
    };
  }

  return { isValid: true, message: "" };
}
