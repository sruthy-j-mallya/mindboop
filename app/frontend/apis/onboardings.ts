import http from "@/apis/axios";
import type { OnboardingResponse } from "@/apis/types";

const show = () => http.get<OnboardingResponse>("/onboarding").then(({ data }) => data);

const onboardingsApi = { show };

export default onboardingsApi;
