import { useEffect, useState } from "react";
import { getPipeline } from "@/services/api/dashboard";
import { PipelineStepData } from "@/types/dashboard";
import { isApiError } from "@/types/api";
import { getAuthToken } from "@/utils/authStorage";

export const usePipeline = () => {
  const [stages, setStages] = useState<PipelineStepData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const token = getAuthToken();
        if (!token) {
          setErrorMessage("Please sign in to view your pipeline.");
          return;
        }

        const response = await getPipeline();
        if (isMounted) {
          setStages(response.stages ?? []);
        }
      } catch (error) {
        if (isMounted) {
          if (isApiError(error)) {
            setErrorMessage(error.data?.message ?? "Unable to load pipeline.");
          } else {
            setErrorMessage("Unable to load pipeline.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stages,
    isLoading,
    errorMessage,
  };
};
