"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  useComments,
  useUpdateComment,
  type UpdateCommentInput,
} from "@/lib/hooks/use-comments";

export default function CommentsPage() {
  const { data: comments = [], isLoading } = useComments();
  const updateMutation = useUpdateComment("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const selectedComment = comments.find((c) => c.id === selectedCommentId);

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    commentId: string,
    newStatus: "approved" | "pending" | "rejected"
  ) => {
    await updateMutation.mutateAsync(commentId, { status: newStatus });
    if (selectedComment?.id === commentId) {
      setSelectedCommentId(null);
      setIsDetailOpen(false);
    }
  };

  const openCommentDetail = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/20 text-success border-success/30";
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      case "rejected":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Comments"
        description="Moderate customer reviews and feedback on products."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-input">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comments Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Comments</CardTitle>
            <CardDescription>
              {filteredComments.length} comment{filteredComments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Product
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Customer
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Rating
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Comment
                    </TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow key={comment.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {comment.productName}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {comment.customer}
                      </TableCell>
                      <TableCell>{renderStars(comment.rating)}</TableCell>
                      <TableCell>
                        <p className="text-foreground truncate max-w-xs">
                          {comment.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${getStatusColor(
                            comment.status
                          )}`}
                        >
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openCommentDetail(comment.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comment Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
            <DialogDescription>
              {selectedComment?.productName} - Review by {selectedComment?.customer}
            </DialogDescription>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-6 py-4">
              {/* Rating and Status */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rating</p>
                  {renderStars(selectedComment.rating)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                  <Badge
                    variant="outline"
                    className={`capitalize ${getStatusColor(
                      selectedComment.status
                    )}`}
                  >
                    {selectedComment.status}
                  </Badge>
                </div>
              </div>

              {/* Comment Content */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground">Review Content</h4>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-foreground leading-relaxed">
                    {selectedComment.content}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground">Customer Info</h4>
                <div className="grid gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-foreground font-medium">
                      {selectedComment.customer}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-foreground">
                      {new Date(selectedComment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground">
                  Moderation Actions
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant={
                      selectedComment.status === "approved"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedComment.id, "approved")
                    }
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending &&
                    selectedComment.status === "approved" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant={
                      selectedComment.status === "pending"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedComment.id, "pending")
                    }
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending &&
                    selectedComment.status === "pending" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Pending
                  </Button>
                  <Button
                    variant={
                      selectedComment.status === "rejected"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedComment.id, "rejected")
                    }
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending &&
                    selectedComment.status === "rejected" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
