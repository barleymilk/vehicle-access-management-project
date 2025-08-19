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

// 날짜 쌍 연동 로직을 처리하는 공통 함수들
export interface DatePairConfig {
  startDateField: string;
  endDateField: string;
}

/**
 * 날짜 쌍 연동 로직을 처리하는 함수
 * @param field - 변경된 필드명
 * @param value - 새로운 값 (Date 또는 undefined)
 * @param data - 현재 데이터 객체
 * @param datePair - 날짜 쌍 설정
 * @returns 연동된 새로운 데이터 객체
 */
export function handleDatePairChange<T extends Record<string, unknown>>(
  field: string,
  value: Date | undefined,
  data: T,
  datePair: DatePairConfig
): T {
  const { startDateField, endDateField } = datePair;
  const newData = { ...data };

  if (field === startDateField) {
    if (value) {
      // 시작일 선택 시
      if (!newData[endDateField]) {
        // 종료일이 없으면 시작일과 같은 날짜로 설정
        newData[endDateField] = value;
      } else if (
        newData[endDateField] instanceof Date &&
        value > newData[endDateField]
      ) {
        // 시작일이 종료일보다 크면 종료일을 시작일과 같은 날짜로 설정
        newData[endDateField] = value;
      }
    } else {
      // 시작일 해제 시 종료일도 해제
      newData[endDateField] = undefined;
    }
  } else if (field === endDateField) {
    if (value) {
      // 종료일 선택 시
      if (!newData[startDateField]) {
        // 시작일이 없으면 종료일과 같은 날짜로 설정
        newData[startDateField] = value;
      } else if (
        newData[startDateField] instanceof Date &&
        value < newData[startDateField]
      ) {
        // 종료일이 시작일보다 작으면 시작일을 종료일과 같은 날짜로 설정
        newData[startDateField] = value;
      }
    } else {
      // 종료일 해제 시 시작일도 해제
      newData[startDateField] = undefined;
    }
  }

  // 현재 필드의 값 설정
  newData[field] = value;

  return newData;
}
