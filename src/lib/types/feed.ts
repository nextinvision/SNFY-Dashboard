import type { Industry } from "./industry";

export type FeedStatus = "enabled" | "disabled";

export interface Feed {
  id: string;
  name: string;
  url: string;
  logo?: string;
  industries: Industry[]; // Array of Industry objects with id and name
  autoUpdate: boolean;
  fullText: boolean;
  status: FeedStatus;
  lastUpdated: string;
  // Contact method fields (Google News Policy requirement - at least one required)
  publisherWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPageUrl?: string;
}

