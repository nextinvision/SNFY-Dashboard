import type { Industry } from "./industry";

export type FeedStatus = "enabled" | "disabled";

export interface Feed {
  id: string;
  name: string;
  url: string;
  logo?: string;
  industries: Industry[];
  autoUpdate: boolean;
  fullText: boolean;
  status: FeedStatus;
  lastUpdated: string;
}

