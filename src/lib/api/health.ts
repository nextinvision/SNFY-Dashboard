/**
 * Health Check API Service
 */

import { apiClient } from './client';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      healthy: boolean;
      message?: string;
    };
  };
}

export const healthApi = {
  async check(): Promise<HealthStatus> {
    // Health endpoint is public, no auth required
    const response = await apiClient.get<HealthStatus>('/health', false);
    return response;
  },
};

