import http from "@/apis/axios";
import type { UpdateUserPreferencePayload, UserPreferenceResponse } from "@/apis/types";

const USER_PREFERENCE_URL = "/user_preference";

const show = () => http.get<UserPreferenceResponse>(USER_PREFERENCE_URL).then(({ data }) => data);

const update = (payload: UpdateUserPreferencePayload) =>
  http.patch<UserPreferenceResponse>(USER_PREFERENCE_URL, payload).then(({ data }) => data);

const userPreferencesApi = { show, update };

export default userPreferencesApi;
