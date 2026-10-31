import { useMutation } from "@tanstack/react-query";

import passwordsApi from "@/apis/passwords";

export const useRequestPasswordReset = () => useMutation({ mutationFn: passwordsApi.create });

export const useResetPassword = () => useMutation({ mutationFn: passwordsApi.update });
