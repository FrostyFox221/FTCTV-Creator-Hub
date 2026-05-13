import { useState, useCallback } from "react";

export function useAdminFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithToken = useCallback(async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("ftctv_admin_token");
      const headers = new Headers(options.headers);
      if (token) {
        headers.set("x-admin-token", token);
      }
      if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || res.statusText || "An error occurred");
      }
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchWithToken, isLoading, error };
}
