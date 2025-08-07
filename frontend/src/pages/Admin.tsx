import { useQuery } from "@tanstack/react-query";
import { fetchAdminEssays, Document, IPFSVersion } from "@/lib/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Shield,
  Eye,
  Calendar,
  Hash,
  Clock,
  User,
} from "lucide-react";

// interface IPFSVersion {
//   cid: string;
//   timestamp: string;
//   wordCount: number;
//   characters: number;
//   size: string;
//   content: string;
// }

// interface Document {
//   id: string;
//   title: string;
//   createdAt: string;
//   lastModified: string;
//   totalVersions: number;
//   currentWordCount: number;
//   status: "verified" | "flagged" | "pending";
//   versions: IPFSVersion[];
// }

const Admin = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [selectedVersion, setSelectedVersion] = useState<IPFSVersion | null>(
    null
  );

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-essays"],
    queryFn: fetchAdminEssays,
  });

  const totalEssays = documents.length;
  const verifiedEssays = documents.filter(
    (doc) => doc.status === "verified"
  ).length;
  const verifiedPercentage =
    totalEssays > 0 ? Math.round((verifiedEssays / totalEssays) * 100) : 0;

  if (isLoading) return <div className="p-4">Loading essays...</div>;
  if (error)
    return <div className="p-4 text-red-500">Failed to load essays</div>;

  // Mock data for a single student's essays
  // const documents: Document[] = [
  //   {
  //     id: "1",
  //     title: "Essay on Climate Change Policy",
  //     createdAt: "2024-01-10T09:00:00Z",
  //     lastModified: "2024-01-15T14:30:00Z",
  //     totalVersions: 23,
  //     currentWordCount: 1847,
  //     status: "verified",
  //     versions: [
  //       {
  //         cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  //         timestamp: "2024-01-15T14:30:00Z",
  //         wordCount: 1847,
  //         characters: 11234,
  //         size: "11.2 KB",
  //         content: "Climate change represents one of the most pressing challenges of our time, requiring immediate and comprehensive policy responses from governments worldwide..."
  //       },
  //       {
  //         cid: "QmPjCxKPNRzv8HvUJQMpzLxEzBqkCa7MRnEp4XyYwZ123A",
  //         timestamp: "2024-01-15T14:15:00Z",
  //         wordCount: 1789,
  //         characters: 10876,
  //         size: "10.9 KB",
  //         content: "Climate change represents one of the most pressing challenges of our time, requiring immediate policy responses from governments..."
  //       },
  //       {
  //         cid: "QmRsKwPvHxCzNrB8QJqGkE4vTmWzYpDhSxMcFn2L9Gy45B",
  //         timestamp: "2024-01-15T14:00:00Z",
  //         wordCount: 1654,
  //         characters: 10234,
  //         size: "10.2 KB",
  //         content: "Climate change represents one of the most pressing challenges of our time..."
  //       }
  //     ]
  //   },
  //   {
  //     id: "2",
  //     title: "Analysis of Modern Literature",
  //     createdAt: "2024-01-08T11:15:00Z",
  //     lastModified: "2024-01-14T16:45:00Z",
  //     totalVersions: 31,
  //     currentWordCount: 2156,
  //     status: "flagged",
  //     versions: [
  //       {
  //         cid: "QmTnVpBx7KzqA9rWxMvJpDhEyUc2XzRfGsLwNm8Qv3PoY",
  //         timestamp: "2024-01-14T16:45:00Z",
  //         wordCount: 2156,
  //         characters: 13245,
  //         size: "13.2 KB",
  //         content: "Modern literature has undergone significant transformations in the 21st century, reflecting changing social dynamics and technological influences..."
  //       }
  //     ]
  //   },
  //   {
  //     id: "3",
  //     title: "Historical Perspectives on Democracy",
  //     createdAt: "2024-01-12T13:30:00Z",
  //     lastModified: "2024-01-13T10:20:00Z",
  //     totalVersions: 12,
  //     currentWordCount: 892,
  //     status: "pending",
  //     versions: [
  //       {
  //         cid: "QmKrWpVx9MzLa8BcTjQvYuEhNdFm3RsGp7ZwXx5KlN2Mq",
  //         timestamp: "2024-01-13T10:20:00Z",
  //         wordCount: 892,
  //         characters: 5456,
  //         size: "5.5 KB",
  //         content: "Democracy, as a form of government, has evolved significantly throughout history, adapting to various cultural and social contexts..."
  //       }
  //     ]
  //   }
  // ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-accent/10">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin View</h1>
              <p className="text-muted-foreground">
                Student Essay Verification History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Student: John Doe
            </Badge>
            {/* <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {documents.length} Essays
            </Badge> */}
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {documents.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Essays</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-ipfs-green" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {documents.reduce((acc, doc) => acc + doc.totalVersions, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">IPFS Versions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {documents.filter((doc) => doc.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pending Essays
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-success" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {verifiedPercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Essays List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="border-border shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <Badge
                    variant={
                      doc.status === "verified" ? "default" : "secondary"
                    }
                    className={
                      doc.status === "verified"
                        ? "bg-green-500 text-white"
                        : doc.status === "flagged"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-black"
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created {formatDate(doc.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Word Count</p>
                    <p className="font-medium">
                      {doc.currentWordCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IPFS Versions</p>
                    <p className="font-medium flex items-center">
                      <Shield className="w-3 h-3 mr-1 text-ipfs-green" />
                      {doc.totalVersions}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedDocument(doc)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Version History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Version History Modal */}
        {selectedDocument && (
          <Dialog
            open={!!selectedDocument}
            onOpenChange={() => setSelectedDocument(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ipfs-green" />
                  {selectedDocument.title} - Version History
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedDocument.versions.map((version, index) => (
                  <Card key={version.cid} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-xs"
                            >
                              <Hash className="w-3 h-3 mr-1" />
                              {version.cid.substring(0, 16)}...
                            </Badge>
                            <Badge
                              variant={index === 0 ? "default" : "secondary"}
                            >
                              {index === 0
                                ? "Latest"
                                : `Version ${
                                    selectedDocument.versions.length - index
                                  }`}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Timestamp</p>
                              <p className="font-medium">
                                {formatTimeAgo(version.timestamp)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Words</p>
                              <p className="font-medium">
                                {version.wordCount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Characters
                              </p>
                              <p className="font-medium">
                                {version.characters.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Size</p>
                              <p className="font-medium">{version.size}</p>
                            </div>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVersion(version)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Content
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Essay Content - {formatDate(version.timestamp)}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>CID: {version.cid}</span>
                                <span>•</span>
                                <span>{version.wordCount} words</span>
                                <span>•</span>
                                <span>{version.size}</span>
                              </div>
                              <div className="prose max-w-none">
                                <div className="p-4 bg-muted rounded-lg border">
                                  <p className="text-foreground leading-relaxed">
                                    {version.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Admin;
