import type { Metadata } from 'next'
import { fetchFundraisingPosts } from '@/lib/api'
import RaisesClient from './RaisesClient'
import type { FundraisingPost } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Fundraising Posts',
  description: 'Discover Lao founders raising their next round. Get the story behind each round straight from the people building it.',
}

export default async function RaisesPage() {
  let posts: FundraisingPost[] = []
  
  try {
    posts = await fetchFundraisingPosts()
  } catch (error) {
    console.error('Failed to fetch fundraising posts:', error)
  }

  return <RaisesClient posts={posts} />
}
