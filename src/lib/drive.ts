import "server-only";
import { UpdateItem } from "@/types";

// Pulls the "Daily Updates" slider content directly from a shared Google
// Drive folder, instead of a hand-maintained static list. Marius uploads a
// video/photo into the folder and puts the day (or "Teaser") in brackets at
// the end of the filename — e.g. "Ridge line above Blankenheim (Day 5).mp4"
// or "Trail teaser (Teaser).mov" — and it shows up here automatically,
// labeled and sorted correctly. No app passwords or OAuth needed: this uses
// a plain Drive API key against a folder shared as "Anyone with the link",
// which Google's API explicitly supports for read-only access.
//
// Setup (see README for the full walkthrough):
//   1. Make sure the Drive folder is shared as "Anyone with the link" (Viewer).
//   2. Create a Google Cloud project, enable the "Google Drive API", and
//      create an API key (restrict it to the Drive API only).
//   3. Set GOOGLE_DRIVE_API_KEY (and GOOGLE_DRIVE_FOLDER_ID, if different
//      from the default below) in .env.local / Vercel env vars.
//
// If the API key isn't configured yet, getDriveUpdates() just returns an
// empty array — src/lib/integrations.ts falls back to the static
// src/data/updates.ts placeholders so the site never breaks.

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3/files";

// Folder ID from the share link Marius sent:
// https://drive.google.com/drive/folders/1FbwIyvFjQSW_DXcFHmXjkMKFwGjKUfXj
const DEFAULT_FOLDER_ID = "1FbwIyvFjQSW_DXcFHmXjkMKFwGjKUfXj";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  createdTime: string;
}

function upscaleThumbnail(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Drive's thumbnailLink defaults to a small size (often "=s220"); bump it
  // up so it doesn't look blurry in the (fairly large) card layout.
  return url.replace(/=s\d+$/, "=s1600");
}

function parseFilename(rawName: string): {
  caption: string;
  label: string | null;
  day: number | null;
  isTeaser: boolean;
} {
  const nameNoExt = rawName.replace(/\.[a-zA-Z0-9]{2,5}$/, "");
  const match = nameNoExt.match(/\(([^)]+)\)\s*$/);

  if (!match) {
    return { caption: nameNoExt.trim(), label: null, day: null, isTeaser: false };
  }

  const bracket = match[1].trim();
  const caption = nameNoExt.slice(0, match.index).trim();

  const dayMatch = bracket.match(/^day\s*(\d+)$/i);
  if (dayMatch) {
    const day = Number(dayMatch[1]);
    return { caption: caption || rawName, label: `Day ${day}`, day, isTeaser: false };
  }

  if (/^teaser$/i.test(bracket)) {
    return { caption: caption || rawName, label: "Teaser", day: null, isTeaser: true };
  }

  // Unrecognized bracket text — still show it as a label rather than
  // silently dropping it, so a typo is obvious instead of invisible.
  return { caption: caption || rawName, label: bracket, day: null, isTeaser: false };
}

export async function getDriveUpdates(): Promise<UpdateItem[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || DEFAULT_FOLDER_ID;

  if (!apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and (mimeType contains 'video/' or mimeType contains 'image/') and trashed = false`,
    fields: "files(id,name,mimeType,thumbnailLink,createdTime)",
    orderBy: "createdTime",
    pageSize: "100",
    key: apiKey,
  });

  try {
    const res = await fetch(`${DRIVE_API_BASE}?${params.toString()}`, {
      // Re-check every 5 minutes rather than on every request — the folder
      // only changes when Marius uploads something new, and this keeps us
      // well clear of any Drive API rate limits.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Drive API error", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as { files?: DriveFile[] };
    const files = data.files ?? [];

    const items: UpdateItem[] = files.map((file) => {
      const parsed = parseFilename(file.name);
      return {
        id: file.id,
        day: parsed.day,
        type: file.mimeType.startsWith("video/") ? "video" : "photo",
        caption: parsed.caption,
        timestamp: file.createdTime,
        label: parsed.label ?? undefined,
        isTeaser: parsed.isTeaser,
        driveFileId: file.id,
        thumbnailUrl: upscaleThumbnail(file.thumbnailLink),
      };
    });

    // Teaser(s) first, then in day order, then anything unlabeled by
    // upload time — so the slider always reads in a sensible order even
    // before every day's video has been uploaded.
    return items.sort((a, b) => {
      if (a.isTeaser !== b.isTeaser) return a.isTeaser ? -1 : 1;
      if (a.day != null && b.day != null) return a.day - b.day;
      if (a.day != null) return -1;
      if (b.day != null) return 1;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (err) {
    console.error("Failed to fetch Drive updates", err);
    return [];
  }
}
