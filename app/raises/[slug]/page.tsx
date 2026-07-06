import { fetchFundraisingPostBySlug } from '@/features/raises/api/raisesApi'
import { ArrowLeft, Calendar, ExternalLink, Mail, Target } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostReactions from '@/components/raises/PostReactions'
import CommentSection from '@/components/raises/CommentSection'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const post = await fetchFundraisingPostBySlug(resolvedParams.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} | ${post.companyName}`,
    description: post.excerpt,
  }
}

const fmt = (v: number | null | undefined) =>
  v == null ? null : v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${v.toLocaleString()}`

export default async function FundraisingPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await fetchFundraisingPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  // Fallbacks for fields that the backend hasn't provided yet
  // We'll optionally render them if they exist in the future, 
  // but for now they will be undefined/null in our API type.
  const content = post.content || post.excerpt
  const minTicketUsd = post.minTicketUsd
  const deadlineDate = post.deadline ? new Date(post.deadline).toLocaleDateString() : null
  const contactEmail = post.contactEmail
  const pitchDeckUrl = post.pitchDeckUrl
  const websiteUrl = post.websiteUrl

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        
        <Link
          href="/raises"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all posts
        </Link>

        {/* Cover Image */}
        {post.coverUrl && (
          <div className="relative mb-8 w-full aspect-[16/7] overflow-hidden rounded-2xl shadow-sm bg-slate-100 dark:bg-slate-900">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            {post.roundType}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {post.companyName}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Key Metrics Grid */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:grid-cols-3">
          {fmt(post.targetAmountUsd) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Target raise</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                <Target className="h-5 w-5 text-indigo-500" /> {fmt(post.targetAmountUsd)}
              </p>
            </div>
          )}
          {fmt(minTicketUsd) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Min ticket</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{fmt(minTicketUsd)}</p>
            </div>
          )}
          {deadlineDate && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Deadline</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
                <Calendar className="h-5 w-5 text-indigo-500" />
                {deadlineDate}
              </p>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert mt-12 max-w-none whitespace-pre-wrap">
          {content}
        </div>

        {/* Post Reactions */}
        <div className="mt-8">
          <PostReactions postId={post.id} /> 
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interested in this round?</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Connect directly with the founder to learn more about this opportunity.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
              >
                <Mail className="h-4 w-4" /> Contact founder
              </a>
            )}
            {pitchDeckUrl && (
              <a
                href={pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <ExternalLink className="h-4 w-4" /> Pitch deck
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <ExternalLink className="h-4 w-4" /> Website
              </a>
            )}
            {!contactEmail && !pitchDeckUrl && !websiteUrl && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">
                Contact information not provided for this round.
              </p>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <CommentSection postId={post.id} />

      </article>
    </div>
  )
}
