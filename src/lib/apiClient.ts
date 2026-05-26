import axios, { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, string[]>;
}

export const apiClient = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as
      | { message?: string; code?: string; errors?: Record<string, string[]> }
      | undefined;

    const apiError: ApiError = {
      message: responseData?.message ?? "An unexpected error occurred.",
      code: responseData?.code ?? "UNKNOWN_ERROR",
      status: error.response?.status ?? 0,
      details: responseData?.errors,
    };

    return Promise.reject(apiError);
  }
);

