'use client'

import { useCommentSection } from '../hooks/useCommentSection'
import { hasPermission } from '@/lib/auth'
import ReactionButtons from './ReactionButtons'
import { formatDistanceToNow } from 'date-fns'
import { formatDate } from '@/lib/utils'

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const {
    user,
    comments,
    newComment,
    isSubmitting,
    isLoading,
    mounted,
    handleCommentChange,
    handleSubmit
  } = useCommentSection(postId)

  return (
    <div className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        !hasPermission(user, 'create:comments') ? (
          <div className="mb-10 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center border border-zinc-200 dark:border-zinc-800/50">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">Upgrade to Membership to join the discussion and comment on posts.</p>
            <a href="/pricing" className="inline-flex px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Upgrade to Membership
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-10 flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`} 
              alt={user.username} 
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-zinc-100 dark:bg-zinc-800"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                rows={3}
                required
              />
              <div className="mt-3 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        )
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center border border-zinc-200 dark:border-zinc-800/50">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">You must be logged in to post a comment.</p>
          <a href="/login" className="inline-flex px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            Log in
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-10 text-zinc-500 dark:text-zinc-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={comment.avatarUrl || `https://ui-avatars.com/api/?name=${comment.username}`} 
                alt={comment.username} 
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-zinc-100 dark:bg-zinc-800"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{comment.username}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {mounted 
                      ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) 
                      : formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 mb-3 whitespace-pre-wrap">
                  {comment.content}
                </p>
                <ReactionButtons 
                  targetId={comment.id}
                  targetType="comment"
                  initialLikes={comment.likes}
                  initialDislikes={comment.dislikes}
                  initialReaction={comment.currentUserReaction}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
