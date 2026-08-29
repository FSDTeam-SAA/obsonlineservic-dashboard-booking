"use client";

import { useState, useCallback } from "react";
import { uploadSingleImage } from "@/features/upload/api/upload.api";

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  clearError: () => void;
}

/**
 * Custom hook that encapsulates single-image upload state and logic.
 * Provides consistent loading states, error handling, and telemetry dispatch.
 *
 * @example
 * const { uploading, error, upload } = useImageUpload();
 * const url = await upload(file);
 * if (url) setImageUrl(url);
 */
export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const url = await uploadSingleImage(file);
      return url;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again.";
      setError(message);
      console.error("[useImageUpload] Upload failed:", err);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { uploading, error, upload, clearError };
}
