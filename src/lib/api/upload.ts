/**
 * Upload API Service
 */

import { apiClient } from './client';

export interface UploadLogoResponse {
  logoUrl: string;
}

export const uploadApi = {
  async uploadLogo(file: File): Promise<UploadLogoResponse> {
    const response = await apiClient.uploadFile<{ logoUrl: string }>('/upload/logo', file);
    return response;
  },
};

