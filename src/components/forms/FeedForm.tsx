'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Feed } from "@/lib/types/feed";
import type { Industry } from "@/lib/types/industry";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { IndustryMultiSelect } from "./IndustryMultiSelect";
import { FileUpload } from "./FileUpload";
import { feedsApi } from "@/lib/api/feeds";
import { uploadApi } from "@/lib/api/upload";
import { ApiClientError } from "@/lib/api/client";

interface FeedFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<Feed>;
  feedId?: string;
}

export function FeedForm({ mode, initialValues, feedId }: FeedFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [logoUrl, setLogoUrl] = useState(initialValues?.logo ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
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
  // Contact method fields (Google News Policy requirement - at least one required)
  const [publisherWebsite, setPublisherWebsite] = useState(
    initialValues?.publisherWebsite ?? "",
  );
  const [contactEmail, setContactEmail] = useState(
    initialValues?.contactEmail ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    initialValues?.contactPhone ?? "",
  );
  const [contactPageUrl, setContactPageUrl] = useState(
    initialValues?.contactPageUrl ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate that at least one contact method is provided
      const hasContactInfo =
        (publisherWebsite && publisherWebsite.trim() !== "") ||
        (contactEmail && contactEmail.trim() !== "") ||
        (contactPhone && contactPhone.trim() !== "") ||
        (contactPageUrl && contactPageUrl.trim() !== "");

      if (!hasContactInfo) {
        setError(
          "At least one contact method must be provided: Publisher Website, Contact Email, Contact Phone, or Contact Page URL",
        );
        setIsSubmitting(false);
        return;
      }

      // Upload logo file if provided
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        const uploadResponse = await uploadApi.uploadLogo(logoFile);
        finalLogoUrl = uploadResponse.logoUrl;
      }

      // Prepare payload - industries should be array of IDs
      const industryIds = industries.map((ind) => ind.id);

      // Prepare contact fields - only include non-empty values
      const contactFields: {
        publisherWebsite?: string;
        contactEmail?: string;
        contactPhone?: string;
        contactPageUrl?: string;
      } = {};
      if (publisherWebsite && publisherWebsite.trim() !== "") {
        contactFields.publisherWebsite = publisherWebsite.trim();
      }
      if (contactEmail && contactEmail.trim() !== "") {
        contactFields.contactEmail = contactEmail.trim();
      }
      if (contactPhone && contactPhone.trim() !== "") {
        contactFields.contactPhone = contactPhone.trim();
      }
      if (contactPageUrl && contactPageUrl.trim() !== "") {
        contactFields.contactPageUrl = contactPageUrl.trim();
      }

      if (mode === "create") {
        await feedsApi.create({
          name,
          url,
          logoUrl: finalLogoUrl || undefined,
          industries: industryIds,
          autoUpdate,
          fullText,
          enabled,
          ...contactFields,
        });
      } else if (feedId) {
        await feedsApi.update(feedId, {
          name,
          url,
          logoUrl: finalLogoUrl || undefined,
          industries: industryIds,
          autoUpdate,
          fullText,
          enabled,
          ...contactFields,
        });
      }

      // Redirect to feeds list
      router.push("/dashboard/feeds");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || `Failed to ${mode === "create" ? "create" : "update"} feed`);
      } else {
        setError(`An unexpected error occurred. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <FileUpload
        label="Upload Logo"
        value={logoFile ? URL.createObjectURL(logoFile) : logoUrl || undefined}
        onChange={(file) => setLogoFile(file)}
      />
      <IndustryMultiSelect selected={industries} onChange={setIndustries} />
      
      {/* Contact Method Fields Section */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          Contact Information
          <span className="ml-1 text-red-500">*</span>
        </h3>
        <p className="mb-4 text-xs text-zinc-600">
          At least one contact method is required (Google News Policy requirement)
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Publisher Website"
            placeholder="https://example.com"
            type="url"
            value={publisherWebsite}
            onChange={(event) => setPublisherWebsite(event.target.value)}
          />
          <Input
            label="Contact Email"
            placeholder="contact@example.com"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
          />
          <Input
            label="Contact Phone"
            placeholder="+1-555-123-4567"
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
          />
          <Input
            label="Contact Page URL"
            placeholder="https://example.com/contact"
            type="url"
            value={contactPageUrl}
            onChange={(event) => setContactPageUrl(event.target.value)}
          />
        </div>
      </div>

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
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Save feed"
              : "Update feed"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard/feeds")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

