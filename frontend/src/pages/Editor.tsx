import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { SAVE_TIMEOUT } from "@/lib/utils";

interface DocumentHistory {
  text: string;
  timestamp: number;
  cid: string;
}

interface DocumentResponse {
  history: DocumentHistory[];
}

interface SaveResponse {
  message: string;
  cid: string;
}

const Editor = () => {
  const { id: name } = useParams();
  const isNewDocument = name === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewDocument);
  const [lastSavedContent, setLastSavedContent] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch document data from API
  useEffect(() => {
    if (!isNewDocument && name) {
      fetchDocument();
    }
  }, [name, isNewDocument]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `http://localhost:7474/api/doc?name=${encodeURIComponent(name!)}`
      );

      if (response.ok) {
        const data: DocumentResponse = await response.json();

        // Use the most recent version (last item in history)
        if (data.history && data.history.length > 0) {
          const latestVersion = data.history[data.history.length - 1];
          setContent(latestVersion.text);
          setTitle(name || "Untitled Document");
          setLastSavedContent(latestVersion.text);
        } else {
          setContent("");
          setTitle(name || "Untitled Document");
          setLastSavedContent("");
        }
      } else if (response.status === 404) {
        // Document doesn't exist, create a new one with this title
        setTitle(name || "Untitled Document");
        setContent("");
        setLastSavedContent("");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to load document");
      // On error, still create a new document with the title
      setTitle(name || "Untitled Document");
      setContent("");
      setLastSavedContent("");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  // Word and character count calculation
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(content.length);
  }, [content]);

  // Auto-save every few seconds if content has changed
  useEffect(() => {
    // Only auto-save if content has actually changed since last save
    if (content !== lastSavedContent) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for 10 seconds
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(false); // Auto-save
      }, SAVE_TIMEOUT);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, lastSavedContent]);

  const saveDocument = async (isManualSave = false) => {
    // Don't save if content hasn't changed
    if (content === lastSavedContent) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("http://localhost:7474/api/doc/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title || "Untitled Document",
          text: content,
        }),
      });

      if (response.ok) {
        const data: SaveResponse = await response.json();
        setLastSaved(new Date());
        setLastSavedContent(content);
        // Only show success toast for manual saves
        if (isManualSave) {
          toast.success("Document saved successfully");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save document"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveDocument(true); // Manual save
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              <span>{characterCount} characters</span>
              {lastSaved && <span>Last saved {formatDate(lastSaved)}</span>}
            </div>
          </div>

          <Button
            onClick={handleManualSave}
            disabled={isSaving}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Editor */}
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Document"
            className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground mb-8"
          />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your document..."
            className="w-full min-h-[70vh] text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
