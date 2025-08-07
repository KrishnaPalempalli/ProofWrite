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
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
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

    parsedVersions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const wordCounts = parsedVersions.map(v => v.wordCount);
    const currentWordCount = wordCounts.at(-1) || 0;
    const firstVersionWords = wordCounts[0] || 0;

    // Determine status
    let status: "pending" | "flagged" | "verified" = "verified";

    if (currentWordCount < 100) {
      status = "pending";
    } else if (firstVersionWords > 200) {
      status = "flagged";
    } else {
      for (let i = 1; i < wordCounts.length; i++) {
        const delta = Math.abs(wordCounts[i] - wordCounts[i - 1]);
        if (delta >= 500) {
          status = "flagged";
          break;
        }
      }
    }

    return {
      id: `${index + 1}`,
      title,
      createdAt: parsedVersions[0].timestamp,
      lastModified: parsedVersions.at(-1)?.timestamp || parsedVersions[0].timestamp,
      totalVersions: parsedVersions.length,
      currentWordCount,
      status,
      versions: parsedVersions.reverse(), // reverse for latest version first in UI
    };
  });

  return documents;
}
