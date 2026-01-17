import { useState } from "react";
import { registerUser } from "@/services/api/auth";
import { AuthErrorMap, RegisterPayload, RegisterResponse } from "@/types/auth";
import { isApiError } from "@/types/api";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthErrorMap>({});

  const register = async (payload: RegisterPayload): Promise<RegisterResponse | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const response = await registerUser(payload);
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
