import { useState } from "react";
import { registerUser } from "@/services/api/auth";
import { AuthErrorMap, AuthResponse, RegisterPayload } from "@/types/auth";
import { isApiError } from "@/types/api";
import { setAuthSession } from "@/utils/authStorage";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthErrorMap>({});

  const register = async (payload: RegisterPayload): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const response = await registerUser(payload);
      setAuthSession(response);
      return response;
    } catch (error) {
      if (isApiError(error)) {
        const apiMessage = error.data?.message ?? "Registration failed";
        setErrorMessage(apiMessage);

        if (typeof error.data?.errors === "object" && error.data?.errors) {
          setFieldErrors(error.data.errors);
        }
      } else {
        setErrorMessage("Registration failed");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    errorMessage,
    fieldErrors,
  };
};
