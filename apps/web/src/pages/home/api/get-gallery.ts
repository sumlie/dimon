const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3001";

type PayloadMedia = {
  id: string | number;
  url?: string | null;
  mimeType?: string | null;
};

type PayloadMediaResponse = {
  docs: PayloadMedia[];
};

export async function fetchGalleryPhotos(): Promise<string[]> {
  const folderId = process.env.GALLERY_FOLDER_ID;

  if (!folderId) {
    throw new Error("GALLERY_FOLDER_ID is not configured");
  }

  const params = new URLSearchParams({
    "where[_h_folders][equals]": folderId,
    "where[mimeType][contains]": "image/",
    depth: "0",
    limit: "100",
    sort: "-createdAt",
  });

  const res = await fetch(`${PAYLOAD_URL}/api/media?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch gallery photos: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as PayloadMediaResponse;

  return data.docs
    .map((photo) => {
      if (!photo.url) return null;

      return new URL(photo.url, PAYLOAD_URL).toString();
    })
    .filter((url): url is string => url !== null);
}