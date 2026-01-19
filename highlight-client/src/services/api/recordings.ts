import { request } from "@/services/api/client";
import { ApiListResponse } from "@/types/api";
import { RecordingApi, RecordingCreateInput } from "@/types/recordings";
import { getAuthToken } from "@/utils/authStorage";

export const getRecordings = async () => {
  return request<ApiListResponse<RecordingApi>>("/recordings");
};

export const uploadRecording = (
  input: RecordingCreateInput,
  onProgress?: (percent: number) => void
): Promise<RecordingApi> => {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("title", input.title);
  formData.append("game", input.game);

  const token = getAuthToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/recordings");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress?.(percent);
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as RecordingApi;
          resolve(data);
        } catch (error) {
          reject(error);
        }
        return;
      }
      reject(new Error("upload failed"));
    });

    xhr.addEventListener("error", () => reject(new Error("upload failed")));
    xhr.send(formData);
  });
};

export const getRecordingThumbnail = async (uuid: string): Promise<string> => {
  const token = getAuthToken();
  const response = await fetch(`/recordings/${uuid}/thumbnail`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("thumbnail fetch failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const getRecordingVideo = async (uuid: string): Promise<string> => {
  const token = getAuthToken();
  const response = await fetch(`/recordings/${uuid}/video`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("video fetch failed");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
