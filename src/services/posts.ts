import { CampusPost, Comment } from "@/types";
import {
  campusPosts as mockPosts,
  comments as mockComments,
  getCampusPosts as _getCampusPosts,
  getCampusPostById as _getCampusPostById,
  getCommentsByPost as _getCommentsByPost,
  getPostsByUser as _getPostsByUser,
  getPostsByType as _getPostsByType,
} from "@/data/posts";

export function getCampusPosts(campusId: string): CampusPost[] {
  return _getCampusPosts(campusId);
}

export function getCampusPostById(id: string): CampusPost | undefined {
  return _getCampusPostById(id);
}

export function getCommentsByPost(postId: string): Comment[] {
  return _getCommentsByPost(postId);
}

export function getPostsByUser(userId: string): CampusPost[] {
  return _getPostsByUser(userId);
}

export function getPostsByType(
  campusId: string,
  type: CampusPost["type"]
): CampusPost[] {
  return _getPostsByType(campusId, type);
}

export function createPost(
  post: Omit<CampusPost, "id" | "createdAt" | "likes" | "commentCount">
): CampusPost {
  const newPost: CampusPost = {
    ...post,
    id: `cp${mockPosts.length + 1}`,
    likes: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
  mockPosts.push(newPost);
  return newPost;
}

export function addComment(
  comment: Omit<Comment, "id" | "createdAt" | "likes">
): Comment {
  const newComment: Comment = {
    ...comment,
    id: `cm${mockComments.length + 1}`,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  mockComments.push(newComment);

  const post = mockPosts.find((p) => p.id === comment.postId);
  if (post) post.commentCount++;

  return newComment;
}

export function togglePostLike(postId: string, userId: string): void {
  const post = mockPosts.find((p) => p.id === postId);
  if (post) {
    if (post.isLiked) {
      post.likes--;
      post.isLiked = false;
    } else {
      post.likes++;
      post.isLiked = true;
    }
  }
}
