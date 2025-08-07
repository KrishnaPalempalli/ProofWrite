import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Calendar, Search, Grid3X3, List, Settings } from "lucide-react";

interface Document {
  id: string;
  title: string;
  lastModified: string;
  preview: string;
  createdAt: string;
}

const Dashboard = () => {
  const [documents] = useState<Document[]>([
    {
      id: "1",
      title: "Essay on Climate Change Policy",
      lastModified: "2024-01-15T14:30:00Z",
      preview: "Climate change represents one of the most pressing challenges of our time...",
      createdAt: "2024-01-10T09:00:00Z"
    },
    {
      id: "2", 
      title: "Analysis of Modern Literature",
      lastModified: "2024-01-14T16:45:00Z",
      preview: "Modern literature reflects the complexities of contemporary society...",
      createdAt: "2024-01-08T11:15:00Z"
    },
    {
      id: "3",
      title: "Historical Perspectives on Democracy",
      lastModified: "2024-01-13T10:20:00Z", 
      preview: "Democracy has evolved significantly throughout history...",
      createdAt: "2024-01-12T13:30:00Z"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
          <Link to="/editor/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </Link>
        </div>

        {/* Documents */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
          {filteredDocuments.map((doc) => (
            <Link key={doc.id} to={`/editor/${doc.id}`}>
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
            <h3 className="text-xl font-semibold text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first document to get started.
            </p>
            <Link to="/editor/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </Link>
          </div>
        )}

        {filteredDocuments.length === 0 && searchQuery !== "" && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              No documents match your search for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;