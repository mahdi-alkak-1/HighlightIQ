import { useCallback, useEffect, useState } from "react";
import { getRecordings, getRecordingThumbnail, uploadRecording } from "@/services/api/recordings";
import { RecordingApi, RecordingCreateInput } from "@/types/recordings";
import { isApiError } from "@/types/api";
import { markUploadStarted } from "@/utils/pipelineTimeline";

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<RecordingApi[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadRecordings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getRecordings();
      setRecordings(response.data ?? []);
    } catch (error) {
      if (isApiError(error)) {
        setErrorMessage(error.data?.message ?? "Unable to load recordings.");
      } else {
        setErrorMessage("Unable to load recordings.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  useEffect(() => {
    let isMounted = true;

    const loadThumbnails = async () => {
      const available = recordings.filter((rec) => rec.ThumbnailPath);
      const unique = Array.from(new Set(available.map((rec) => rec.UUID)));
      const results = await Promise.allSettled(unique.map((id) => getRecordingThumbnail(id)));

      if (!isMounted) {
        return;
      }

      const next: Record<string, string> = {};
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          next[unique[index]] = result.value;
        }
      });

      Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
      setThumbnails(next);
    };

    if (recordings.length > 0) {
      loadThumbnails();
    }

    return () => {
      isMounted = false;
      Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [recordings]);

  const upload = async (input: RecordingCreateInput) => {
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const created = await uploadRecording(input, setUploadProgress);
      setRecordings((prev) => [created, ...prev]);
      markUploadStarted(created.ID);
      return created;
    } catch (error) {
      if (isApiError(error)) {
        setErrorMessage(error.data?.message ?? "Upload failed.");
      } else {
        setErrorMessage("Upload failed.");
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    recordings,
    thumbnails,
    isLoading,
    errorMessage,
    isUploading,
    uploadProgress,
    upload,
    reload: loadRecordings,
  };
};
