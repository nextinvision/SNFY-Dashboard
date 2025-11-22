import type { Feed } from "./types/feed";
import type { User } from "./types/user";

export const mockFeeds: Feed[] = [
  {
    id: "feed-1",
    name: "Fintech Today",
    url: "https://fintechtoday.co/rss",
    logo: "/globe.svg",
    industries: ["FinTech", "SaaS"],
    autoUpdate: true,
    fullText: false,
    status: "enabled",
    lastUpdated: "2025-11-20T09:23:00Z",
  },
  {
    id: "feed-2",
    name: "Agri Growth Weekly",
    url: "https://agriweekly.example.com/rss",
    logo: "/globe.svg",
    industries: ["AgriTech"],
    autoUpdate: false,
    fullText: false,
    status: "disabled",
    lastUpdated: "2025-11-18T12:05:00Z",
  },
  {
    id: "feed-3",
    name: "Space Frontier News",
    url: "https://spacefrontier.example.com/rss",
    logo: "/globe.svg",
    industries: ["SpaceTech", "AI"],
    autoUpdate: true,
    fullText: true,
    status: "enabled",
    lastUpdated: "2025-11-21T07:41:00Z",
  },
];

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Harish G",
    email: "harish@snsfy.io",
    role: "administrator",
    status: "active",
    lastLogin: "2025-11-21T05:12:00Z",
  },
  {
    id: "user-2",
    name: "Mira Patel",
    email: "mira@snsfy.io",
    role: "author",
    status: "active",
    lastLogin: "2025-11-20T21:19:00Z",
  },
];

