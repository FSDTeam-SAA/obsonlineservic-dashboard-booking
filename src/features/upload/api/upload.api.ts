/**
 * upload.api.ts — Dashboard
 * Centralized API client for all backend upload endpoints.
 * Endpoints: POST /upload/image | /upload/multiple-images | /upload/file
 */

import { api } from '@/lib/api';
import { unwrapData } from '@/lib/api-unwrap';
import {
  UploadImageResponse,
  UploadMultipleImagesResponse,
  UploadFileResponse,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_FILE_SIZE_BYTES,
} from '../types';

// ─── Client-Side Validators ───────────────────────────────────────────────────

/**
 * Validates a single image file before upload.
 * @throws Error with user-friendly message on validation failure
 */
export function validateImageFile(file: File): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
    throw new Error(`Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.`);
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Image is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`);
  }
}

/**
 * Validates a document file before upload.
 * @throws Error with user-friendly message on validation failure
 */
export function validateDocumentFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`);
  }
}

// ─── Upload API Functions ─────────────────────────────────────────────────────

/**
 * Upload a single image file.
 * @returns Hosted image URL string
 */
export async function uploadSingleImage(file: File): Promise<string> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<UploadImageResponse>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const unwrapped = unwrapData<{ url: string }>(response.data);
  return unwrapped?.url || response.data?.data?.url || '';
}

/**
 * Upload multiple image files at once (max 10).
 * @returns Array of hosted image URL strings
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    throw new Error('Please select at least one image to upload.');
  }
  if (files.length > 10) {
    throw new Error('You can upload a maximum of 10 images at once.');
  }

  files.forEach(validateImageFile);

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await api.post<UploadMultipleImagesResponse>(
    '/upload/multiple-images',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  const unwrapped = unwrapData<{ urls: string[] }>(response.data);
  return unwrapped?.urls || response.data?.data?.urls || [];
}

/**
 * Upload a PDF or document file.
 * @returns Hosted document URL string
 */
export async function uploadDocument(file: File): Promise<string> {
  validateDocumentFile(file);

  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadFileResponse>('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const unwrapped = unwrapData<{ url: string }>(response.data);
  return unwrapped?.url || response.data?.data?.url || '';
}
