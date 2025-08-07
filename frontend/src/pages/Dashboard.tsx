import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Calendar,
  Search,
  Grid3X3,
  List,
  Settings,
} from "lucide-react";

interface DocumentVersion {
  text: string;
  timestamp: number;
  cid: string;
}

interface ApiResponse {
  [documentTitle: string]: DocumentVersion[];
}

interface Document {
  title: string;
  lastModified: string;
  preview: string;
  createdAt: string;
  latestVersion: DocumentVersion;
}

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:7474/api/doc");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();

        // Transform the API response to match our Document interface
        const transformedDocuments: Document[] = Object.entries(data).map(
          ([title, versions]) => {
            // Sort versions by timestamp to get the latest
            const sortedVersions = versions.sort(
              (a, b) => b.timestamp - a.timestamp
            );
            const latestVersion = sortedVersions[0];
            const oldestVersion = sortedVersions[sortedVersions.length - 1];

            return {
              title,
              lastModified: new Date(latestVersion.timestamp).toISOString(),
              createdAt: new Date(oldestVersion.timestamp).toISOString(),
              preview:
                latestVersion.text.substring(0, 100) +
                (latestVersion.text.length > 100 ? "..." : ""),
              latestVersion,
            };
          }
        );

        setDocuments(transformedDocuments);
        setError(null);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch documents"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCreateDocument = () => {
    if (newDocumentTitle.trim()) {
      setIsModalOpen(false);
      setNewDocumentTitle("");
      navigate(`/editor/${encodeURIComponent(newDocumentTitle.trim())}`);
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setNewDocumentTitle("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewDocumentTitle("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Error loading documents
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">DocCloud</h1>
            <p className="text-muted-foreground">Manage your documents</p>
          </div>
          <Link to="/admin">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleModalOpen}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>

        {/* Documents */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-2"
          }
        >
          {filteredDocuments.map((doc) => (
            <Link
              key={doc.title}
              to={`/editor/${encodeURIComponent(doc.title)}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-primary rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-medium text-foreground truncate">
                        {doc.title || "Untitled Document"}
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Last modified {formatDate(doc.lastModified)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {viewMode === "grid" && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.preview || "No content yet"}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>

        {filteredDocuments.length === 0 && searchQuery === "" && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No documents yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first document to get started.
            </p>
            <Button onClick={handleModalOpen}>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
        )}

        {filteredDocuments.length === 0 && searchQuery !== "" && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No documents found
            </h3>
            <p className="text-muted-foreground">
              No documents match your search for "{searchQuery}"
            </p>
          </div>
        )}

        {/* New Document Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="document-title" className="text-sm font-medium">
                  Document Title
                </label>
                <Input
                  id="document-title"
                  placeholder="Enter document title..."
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateDocument();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim()}
              >
                Create Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
