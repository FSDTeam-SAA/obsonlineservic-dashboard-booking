// ─────────────────────────────────────────────
// Upload Feature — Shared TypeScript Interfaces
// ─────────────────────────────────────────────

export interface UploadImageResponse {
  statusCode: number;
  success: boolean;
  data: {
    url: string;
    filename: string;
  };
}

export interface UploadMultipleImagesResponse {
  statusCode: number;
  success: boolean;
  data: {
    urls: string[];
    files: string[];
  };
}

export interface UploadFileResponse {
  statusCode: number;
  success: boolean;
  data: {
    url: string;
    filename: string;
  };
}

/** Accepted image MIME types for client-side validation */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as const;

/** Max image size: 5 MB */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Max document size: 10 MB */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
