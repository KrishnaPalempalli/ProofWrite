// src/lib/api.ts

export interface IPFSVersion {
  cid: string;
  timestamp: string; // ISO string
  wordCount: number;
  characters: number;
  size: string;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  createdAt: string;
  lastModified: string;
  totalVersions: number;
  currentWordCount: number;
  status: "verified" | "flagged" | "pending";
  versions: IPFSVersion[];
}

function computeMetadata(text: string): { wordCount: number; characters: number; size: string } {
  const characters = text.length;
  const wordCount = text.trim().split(/\s+/).length;
  const size = (new Blob([text]).size / 1024).toFixed(1) + " KB";
  return { wordCount, characters, size };
}

export async function fetchAdminEssays(): Promise<Document[]> {
  const res = await fetch("http://localhost:7474/api/doc");
  if (!res.ok) throw new Error("Failed to fetch admin essays");
  const data = await res.json();

  const documents: Document[] = Object.entries(data).map(([title, versions]: [string, any[]], index) => {
    const parsedVersions: IPFSVersion[] = versions.map((v) => {
      const { wordCount, characters, size } = computeMetadata(v.text);
      return {
        cid: v.cid,
        timestamp: new Date(v.timestamp).toISOString(),
        wordCount,
        characters,
        size,
        content: v.text,
      };
    });

    parsedVersions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      id: `${index + 1}`,
      title,
      createdAt: parsedVersions[parsedVersions.length - 1].timestamp,
      lastModified: parsedVersions[0].timestamp,
      totalVersions: parsedVersions.length,
      currentWordCount: parsedVersions[0].wordCount,
      status: "pending", // can add dynamic logic later
      versions: parsedVersions,
    };
  });

  return documents;
}
