import type { FundraisingPost } from '@/lib/types'
import { Calendar, Target, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function RaiseCard({ post, priority = false }: { post: FundraisingPost; priority?: boolean }) {
  const isExpired = post.status === 'Expired' || new Date(post.deadline) < new Date()

  return (
    <div className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isExpired ? 'grayscale opacity-75' : ''}`}>
      
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            No Image
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 dark:bg-slate-900/90 px-3 py-1 text-xs font-bold text-slate-900 dark:text-white backdrop-blur-sm shadow-sm">
          {post.roundType}
        </div>
        {isExpired && (
          <div className="absolute right-4 top-4 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm shadow-sm">
            Expired
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {post.companyName}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>
        
        <p className="mb-6 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">Target</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Target className="h-4 w-4 text-indigo-500" />
              ${(post.targetAmountUsd / 1000000).toFixed(1)}M
            </span>
          </div>
          <Link
            href={`/raises/${post.slug}`}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            Read Story
          </Link>
        </div>
      </div>
    </div>
  )
}
