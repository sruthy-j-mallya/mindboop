import { useMutation } from "@tanstack/react-query";

import emailConfirmationsApi from "@/apis/email_confirmations";

export const useRequestEmailConfirmation = () => useMutation({ mutationFn: emailConfirmationsApi.create });
