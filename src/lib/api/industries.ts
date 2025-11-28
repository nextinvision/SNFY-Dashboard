/**
 * Industries API Service
 */

import { apiClient } from './client';
import type { Industry } from '../types/industry';

// Transform backend industry format to frontend format
function transformIndustry(backendIndustry: any): Industry {
  return {
    id: backendIndustry.id,
    name: backendIndustry.name,
  };
}

export const industriesApi = {
  async list(): Promise<Industry[]> {
    const response = await apiClient.get<any[]>('/industries');
    return response.map(transformIndustry);
  },
};

