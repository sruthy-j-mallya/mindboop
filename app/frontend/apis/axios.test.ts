import type { AxiosAdapter } from "axios";

import http, { ApiError } from "@/apis/axios";

const respondWith =
  (status: number, data: unknown): AxiosAdapter =>
  async (config) => {
    const response = { data, status, statusText: "", headers: {}, config };
    if (status >= 400) throw Object.assign(new Error("Request failed"), { isAxiosError: true, response });
    return response;
  };

describe("http", () => {
  it("sends snake_case and returns camelCase", async () => {
    const adapter = vi.fn(respondWith(200, { user: { email_address: "a@example.com" } }));

    const { data } = await http.post("/session", { emailAddress: "a@example.com" }, { adapter });

    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ email_address: "a@example.com" });
    expect(data).toEqual({ user: { emailAddress: "a@example.com" } });
  });

  it("rejects with an ApiError carrying the server message", async () => {
    const request = http.get("/session", { adapter: respondWith(401, { error: "Not authenticated" }) });

    await expect(request).rejects.toEqual(new ApiError(401, "Not authenticated"));
    await expect(request).rejects.toMatchObject({ status: 401 });
  });
});
