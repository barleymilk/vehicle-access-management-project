import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SearchFilters, VehicleFilters } from "@/types/filters";
import { Vehicle } from "@/types";

interface UseSupabaseOptions {
  onError?: (error: unknown) => void;
  onSuccess?: (data: unknown) => void;
}

export function useSupabaseQuery<T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
  options: UseSupabaseOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await query();

      if (result.error) {
        setError(result.error);
        options.onError?.(result.error);
      } else {
        setData(result.data);
        options.onSuccess?.(result.data);
      }
    } catch (err) {
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

// 페이지네이션을 지원하는 쿼리 훅
export function useSupabaseQueryWithPagination<T>(
  query: () => Promise<{ data: T | null; error: unknown; count?: number }>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [count, setCount] = useState<number | undefined>(undefined);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await query();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        if (result.count !== undefined) {
          setCount(result.count);
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, count, refetch };
}

// 차량 목록 조회 훅 (페이지네이션 지원)
export function useVehicles(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useSupabaseQueryWithPagination(
    async () => {
      const { data, error, count } = await supabase
        .from("Vehicles")
        .select("*", { count: "exact" })
        .order("plate_number", { ascending: false })
        .range(from, to);

      return { data, error, count: count || 0 };
    },
    [page, pageSize] // 페이지나 페이지 크기가 변경될 때마다 재실행
  );
}
export function useFilteredVehicles(
  filters: VehicleFilters,
  page = 1,
  pageSize = 20
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useSupabaseQueryWithPagination(async () => {
    let query = supabase
      .from("Vehicles")
      .select("*", { count: "exact" })
      .order("plate_number", { ascending: false });

    // 필터 적용
    if (filters.plate_number) {
      query = query.ilike("plate_number", `%${filters.plate_number}%`);
    }

    if (filters.vehicle_type) {
      query = query.ilike("vehicle_type", `%${filters.vehicle_type}%`);
    }

    if (filters.is_public_vehicle !== undefined) {
      query = query.eq("is_public_vehicle", filters.is_public_vehicle);
    }

    if (filters.owner_department) {
      query = query.ilike("owner_department", `%${filters.owner_department}%`);
    }

    if (filters.is_free_pass_enabled !== undefined) {
      query = query.eq("is_free_pass_enabled", filters.is_free_pass_enabled);
    }

    if (filters.special_notes) {
      query = query.ilike("special_notes", `%${filters.special_notes}%`);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.access_start_date) {
      const startDate = new Date(filters.access_start_date);
      startDate.setHours(0, 0, 0, 0);
      const utcStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.gte("access_start_date", utcStartDate.toISOString());
    }

    if (filters.access_end_date) {
      const endDate = new Date(filters.access_end_date);
      endDate.setHours(23, 59, 59, 999);
      const utcEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.lte("access_end_date", utcEndDate.toISOString());
    }

    const { data, error, count } = await query.range(from, to);

    return { data, error, count: count || 0 };
  }, [filters, page, pageSize]);
}

// 운전자 목록 조회 훅
export function usePeople() {
  return useSupabaseQueryWithPagination(async () => {
    const { data, error, count } = await supabase
      .from("People")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false });

    return { data, error, count: count || 0 };
  }, []);
}

// 필터링된 운전자 목록 조회 훅
export function useFilteredPeople(
  filters: {
    name?: string;
    organization?: string;
    position?: string;
    phone_number?: string;
    status?: string;
    department?: string;
    vip_level?: string;
    is_worker?: boolean;
    activity_start_date?: Date;
    activity_end_date?: Date;
  },
  page = 1,
  pageSize = 20
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useSupabaseQueryWithPagination(async () => {
    let query = supabase.from("People").select("*", { count: "exact" });

    // 필터 적용
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }

    if (filters.organization) {
      query = query.ilike("organization", `%${filters.organization}%`);
    }

    if (filters.department) {
      query = query.ilike("department", `%${filters.department}%`);
    }

    if (filters.position) {
      query = query.ilike("position", `%${filters.position}%`);
    }

    if (filters.phone_number) {
      const cleanPhoneNumber = filters.phone_number.replace(/-/g, "");
      query = query.or(
        `phone_number.ilike.%${cleanPhoneNumber}%,phone_number.ilike.%${filters.phone_number}%`
      );
    }

    if (filters.vip_level) {
      query = query.eq("vip_level", filters.vip_level);
    }

    if (filters.is_worker) {
      query = query.eq("is_worker", filters.is_worker);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.activity_start_date) {
      const startDate = new Date(filters.activity_start_date);
      startDate.setHours(0, 0, 0, 0);
      const utcStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.gte("activity_start_date", utcStartDate.toISOString());
    }

    if (filters.activity_end_date) {
      const endDate = new Date(filters.activity_end_date);
      endDate.setHours(23, 59, 59, 999);
      const utcEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.lte("activity_end_date", utcEndDate.toISOString());
    }

    const { data, error, count } = await query.range(from, to);

    return { data, error, count: count || 0 };
  }, [filters, page, pageSize]);
}

// People 테이블에 데이터 추가 함수
export async function addPersonToSupabase(personData: {
  name?: string;
  organization?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  vip_level?: string;
  is_worker?: boolean;
  status?: string;
  activity_start_date?: Date;
  activity_end_date?: Date;
  contact_person_name?: string;
  contact_person_phone?: string;
}) {
  try {
    // 필수 필드 검증
    if (!personData.name) {
      throw new Error("이름은 필수 입력 항목입니다.");
    }

    // 기본값 설정
    const dataToInsert: {
      name: string;
      organization: string;
      department: string;
      position: string;
      phone_number: string;
      vip_level: string;
      is_worker: boolean;
      status: string;
      contact_person_name: string;
      contact_person_phone: string;
      created_at: string;
      updated_at: string;
      activity_start_date?: string;
      activity_end_date?: string;
    } = {
      name: personData.name,
      organization: personData.organization || "",
      department: personData.department || "",
      position: personData.position || "",
      phone_number: personData.phone_number || "",
      vip_level: personData.vip_level || "일반",
      is_worker:
        personData.is_worker !== undefined ? personData.is_worker : false,
      status: personData.status || "active",
      contact_person_name: personData.contact_person_name || "",
      contact_person_phone: personData.contact_person_phone || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 날짜 필드 처리
    if (personData.activity_start_date) {
      dataToInsert.activity_start_date =
        personData.activity_start_date.toISOString();
    }
    if (personData.activity_end_date) {
      dataToInsert.activity_end_date =
        personData.activity_end_date.toISOString();
    }

    const { data, error } = await supabase
      .from("People")
      .insert([dataToInsert])
      .select();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("People 테이블에 데이터 추가 중 오류:", error);
    return { data: null, error };
  }
}

// 출입 기록 조회 훅 (페이지네이션 지원)
export function useAccessRecords(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useSupabaseQueryWithPagination(
    async () => {
      const { data, error, count } = await supabase
        .from("AccessRecords")
        .select("*", { count: "exact" })
        .order("entered_at", { ascending: false, nullsFirst: false })
        .range(from, to);

      return { data, error, count: count || 0 };
    },
    [page, pageSize] // 페이지나 페이지 크기가 변경될 때마다 재실행
  );
}

// 차량 번호로 검색 훅
export function useVehicleSearch(plateNumber: string) {
  const [data, setData] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const search = async () => {
    if (!plateNumber.trim()) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: searchError } = await supabase
        .from("Vehicles")
        .select("*")
        .ilike("plate_number", `%${plateNumber}%`)
        .eq("status", "active");

      if (searchError) {
        setError(searchError);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [plateNumber]);

  return { data, loading, error, refetch: search };
}

// 필터링된 출입 기록 조회 훅
export function useFilteredAccessRecords(
  filters: SearchFilters,
  page = 1,
  pageSize = 20
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useSupabaseQueryWithPagination(async () => {
    let query = supabase
      .from("AccessRecords")
      .select("*", { count: "exact" })
      .order("entered_at", { ascending: false, nullsFirst: false });

    // 필터 적용
    if (filters.plate_number) {
      query = query.ilike("raw_plate_number", `%${filters.plate_number}%`);
    }

    if (filters.vehicle_type) {
      query = query.ilike("raw_vehicle_type", `%${filters.vehicle_type}%`);
    }

    if (filters.name) {
      query = query.ilike("raw_person_name", `%${filters.name}%`);
    }

    if (filters.org_dept_pos) {
      query = query.ilike("driver_organization", `%${filters.org_dept_pos}%`);
    }

    if (filters.phone) {
      const cleanPhoneNumber = filters.phone.replace(/-/g, "");
      query = query.or(
        `raw_person_phone.ilike.%${cleanPhoneNumber}%,raw_person_phone.ilike.%${filters.phone}%`
      );
    }

    if (filters.passengers) {
      query = query.ilike("passengers", `%${filters.passengers}%`);
    }

    if (filters.purpose) {
      query = query.ilike("purpose", `%${filters.purpose}%`);
    }

    if (filters.notes) {
      query = query.ilike("notes", `%${filters.notes}%`);
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      // 한국 시간대(KST) 기준으로 00:00:00 설정
      startDate.setHours(0, 0, 0, 0);
      // UTC로 변환 (한국 시간 + 9시간)
      const utcStartDate = new Date(startDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.gte("entered_at", utcStartDate.toISOString());
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      // 한국 시간대(KST) 기준으로 23:59:59 설정
      endDate.setHours(23, 59, 59, 999);
      // UTC로 변환 (한국 시간 + 9시간)
      const utcEndDate = new Date(endDate.getTime() + 9 * 60 * 60 * 1000);
      query = query.lte("entered_at", utcEndDate.toISOString());
    }

    const { data, error, count } = await query.range(from, to);

    return { data, error, count: count || 0 };
  }, [filters, page, pageSize]);
}

export async function getPhotoPath(photoPath: string) {
  const { data, error } = await supabase.storage
    .from("profile")
    .getPublicUrl(photoPath);
  if (error) {
    console.error("프로필 이미지 URL 가져오기 실패:", error);
    return null;
  }
  return data.publicUrl;
}
