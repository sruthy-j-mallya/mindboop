import { keysToCamelCase, keysToSnakeCase } from "@/utils";

describe("keysToCamelCase", () => {
  it("converts nested object and array keys", () => {
    expect(keysToCamelCase({ email_address: "a", user_list: [{ created_at: 1 }] })).toEqual({
      emailAddress: "a",
      userList: [{ createdAt: 1 }],
    });
  });

  it("leaves non-plain values untouched", () => {
    const formData = new FormData();

    expect(keysToCamelCase(formData)).toBe(formData);
    expect(keysToCamelCase(null)).toBeNull();
  });
});

describe("keysToSnakeCase", () => {
  it("converts nested object and array keys", () => {
    expect(keysToSnakeCase({ passwordConfirmation: "a", items: [{ itemId: 1 }] })).toEqual({
      password_confirmation: "a",
      items: [{ item_id: 1 }],
    });
  });
});
