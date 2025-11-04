import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const sort = searchParams.get('sort')
    const order = searchParams.get('order') || 'desc'
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '30'

    // 2. Validate parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // 3. Build GitHub API URL
    const githubUrl = new URL('https://api.github.com/search/users')
    githubUrl.searchParams.set('q', query)
    if (sort) githubUrl.searchParams.set('sort', sort)
    githubUrl.searchParams.set('order', order)
    githubUrl.searchParams.set('page', page)
    githubUrl.searchParams.set('per_page', perPage)

    // Debug: Log the actual query being sent
    console.log('[GitHub API] Search query:', query)
    console.log('[GitHub API] Full URL:', githubUrl.toString())

    // 4. Call GitHub API with Authorization header
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(githubUrl.toString(), {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    // 5. Handle rate limiting
    const rateLimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
      remaining: parseInt(
        response.headers.get('X-RateLimit-Remaining') || '0'
      ),
      reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
      used: parseInt(response.headers.get('X-RateLimit-Used') || '0'),
    }

    if (response.status === 403 && rateLimit.remaining === 0) {
      const resetDate = new Date(rateLimit.reset * 1000)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          rateLimit,
          resetAt: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    if (!response.ok) {
      const error = await response.json()

      // Rate Limit 에러 처리
      if (response.status === 403 && rateLimit && rateLimit.remaining === 0) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            rateLimit,
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: error.message || 'GitHub API error',
          status: response.status,
          rateLimit,
        },
        { status: response.status }
      )
    }

    // 6. Parse and return response
    const data = await response.json()

    // Debug: Log sample of results with repo counts
    if (data.items && data.items.length > 0) {
      console.log('[GitHub API] Sample results (first 3):')
      data.items.slice(0, 3).forEach((user: any) => {
        console.log(`  - ${user.login}: ${user.public_repos} repos`)
      })
    }

    return NextResponse.json({
      ...data,
      rateLimit,
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
