import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const [count, setCount] = useState<number>(0);

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

// 차량 목록 조회 훅
export function useVehicles() {
  return useSupabaseQuery(
    async () =>
      await supabase
        .from("Vehicles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
  );
}

// 운전자 목록 조회 훅
export function usePeople() {
  return useSupabaseQuery(
    async () =>
      await supabase
        .from("People")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
  );
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

      return { data, error, count: count || undefined };
    },
    [page, pageSize] // 페이지나 페이지 크기가 변경될 때마다 재실행
  );
}

// 차량 번호로 검색 훅
export function useVehicleSearch(plateNumber: string) {
  const [data, setData] = useState<unknown[] | null>(null);
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
