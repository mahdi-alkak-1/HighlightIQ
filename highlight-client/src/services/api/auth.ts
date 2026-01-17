import { request } from "@/services/api/client";
import { RegisterPayload, RegisterResponse } from "@/types/auth";

export const registerUser = async (payload: RegisterPayload) => {
  return request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
