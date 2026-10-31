import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

export type User = { id: number; email_address: string };
type UserResponse = { user: User };

const sessionKey = ["session"];

export function useCurrentUser() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      try {
        return (await api<UserResponse>("/session")).user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email_address: string; password: string }) =>
      api<UserResponse>("/session", { method: "POST", body: credentials }),
    onSuccess: ({ user }) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { email_address: string; password: string; password_confirmation: string }) =>
      api<UserResponse>("/registration", { method: "POST", body: params }),
    onSuccess: ({ user }) => queryClient.setQueryData(sessionKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/session", { method: "DELETE" }),
    onSuccess: () => queryClient.setQueryData(sessionKey, null),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (params: { email_address: string }) =>
      api<{ message: string }>("/passwords", { method: "POST", body: params }),
  });
}

export function useResetPassword(token: string) {
  return useMutation({
    mutationFn: (params: { password: string; password_confirmation: string }) =>
      api<void>(`/passwords/${encodeURIComponent(token)}`, { method: "PATCH", body: params }),
  });
}
