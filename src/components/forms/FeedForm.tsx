'use client';

import { useState } from "react";
import type { Feed } from "@/lib/types/feed";
import type { Industry } from "@/lib/types/industry";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { IndustryMultiSelect } from "./IndustryMultiSelect";
import { FileUpload } from "./FileUpload";

interface FeedFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Feed>;
}

export function FeedForm({ mode, initialValues }: FeedFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [logoUrl, setLogoUrl] = useState(initialValues?.logo ?? "");
  const [logoFile, setLogoFile] = useState<string | undefined>(undefined);
  const [industries, setIndustries] = useState<Industry[]>(
    (initialValues?.industries as Industry[]) ?? [],
  );
  const [autoUpdate, setAutoUpdate] = useState(
    initialValues?.autoUpdate ?? true,
  );
  const [fullText, setFullText] = useState(initialValues?.fullText ?? false);
  const [enabled, setEnabled] = useState(
    initialValues?.status !== "disabled",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      url,
      logo: logoFile ?? logoUrl,
      industries,
      autoUpdate,
      fullText,
      enabled,
    };

    // Placeholder for API integration.
    await new Promise((resolve) => setTimeout(resolve, 900));

    console.info(`${mode === "create" ? "Created" : "Updated"} feed`, payload);
    setIsSubmitting(false);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Input
        label="Feed Name"
        placeholder="Enter feed name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label="Feed URL"
        placeholder="https://example.com/rss"
        type="url"
        required
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      <Input
        label="Feed Logo URL"
        placeholder="https://example.com/logo.png"
        type="url"
        value={logoUrl}
        onChange={(event) => setLogoUrl(event.target.value)}
      />
      <FileUpload label="Upload Logo" value={logoFile} onChange={setLogoFile} />
      <IndustryMultiSelect selected={industries} onChange={setIndustries} />
      <div className="grid gap-4 md:grid-cols-2">
        <Toggle
          label="Enable auto-update"
          checked={autoUpdate}
          onChange={setAutoUpdate}
        />
        <Toggle
          label="Full-text extraction"
          checked={fullText}
          onChange={setFullText}
        />
        <Toggle
          label="Feed enabled"
          checked={enabled}
          onChange={setEnabled}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Save feed"
              : "Update feed"}
        </Button>
        <Button type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}

