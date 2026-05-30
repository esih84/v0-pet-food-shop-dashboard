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
  DropdownMenuSeparator,
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
} from "lucide-react";
import { comments as initialComments, type Comment } from "@/lib/data";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateCommentStatus = (
    commentId: string,
    newStatus: "approved" | "pending" | "rejected"
  ) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, status: newStatus } : c
      )
    );
    if (selectedComment?.id === commentId) {
      setSelectedComment({ ...selectedComment, status: newStatus });
    }
  };

  const openCommentDetail = (comment: Comment) => {
    setSelectedComment(comment);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return Clock;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-warning text-warning"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  const commentStats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    avgRating:
      comments.reduce((sum, c) => sum + c.rating, 0) / comments.length || 0,
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Comments"
        description="Manage product reviews and customer feedback."
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold text-foreground">
                {commentStats.total}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">
                {commentStats.pending}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-success">
                {commentStats.approved}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-destructive">
                {commentStats.rejected}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {commentStats.avgRating.toFixed(1)}
                </p>
                <Star className="h-5 w-5 fill-warning text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
            <SelectTrigger className="w-[180px] bg-input">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Comments Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Comments</CardTitle>
            <CardDescription>
              {filteredComments.length} comment
              {filteredComments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Rating</TableHead>
                  <TableHead className="text-muted-foreground">Comment</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => {
                  const StatusIcon = getStatusIcon(comment.status);
                  return (
                    <TableRow key={comment.id} className="border-border">
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {comment.productName}
                        </p>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {comment.customer}
                      </TableCell>
                      <TableCell>{renderStars(comment.rating)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {comment.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize gap-1 ${getStatusColor(
                            comment.status
                          )}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {comment.createdAt}
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
                              onClick={() => openCommentDetail(comment)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateCommentStatus(comment.id, "approved")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-success" />{" "}
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateCommentStatus(comment.id, "rejected")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2 text-destructive" />{" "}
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Comment Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            {selectedComment && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Review Details
                  </DialogTitle>
                  <DialogDescription>
                    Review for {selectedComment.productName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedComment.customer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedComment.createdAt}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize ${getStatusColor(
                        selectedComment.status
                      )}`}
                    >
                      {selectedComment.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Rating
                    </p>
                    {renderStars(selectedComment.rating)}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Review
                    </p>
                    <p className="text-foreground p-3 rounded-lg bg-secondary/50 border border-border">
                      {selectedComment.content}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Moderation
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          selectedComment.status === "approved"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCommentStatus(selectedComment.id, "approved")
                        }
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant={
                          selectedComment.status === "pending"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCommentStatus(selectedComment.id, "pending")
                        }
                        className="gap-1"
                      >
                        <Clock className="h-4 w-4" /> Pending
                      </Button>
                      <Button
                        variant={
                          selectedComment.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          updateCommentStatus(selectedComment.id, "rejected")
                        }
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
