import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'
import type { GitHubUser } from '@/types'

// Mock UserAvatar (Feature #10: Canvas + WASM)
jest.mock('./UserAvatar', () => ({
  UserAvatar: ({ src, alt, size }: { src: string; alt: string; size?: number }) => (
    <div data-testid="user-avatar" data-src={src} data-alt={alt} data-size={size} />
  ),
}))

describe('UserCard', () => {
  const mockUser: GitHubUser = {
    id: 1,
    login: 'testuser',
    node_id: 'MDQ6VXNlcjE=',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    gravatar_id: null,
    url: 'https://api.github.com/users/testuser',
    html_url: 'https://github.com/testuser',
    type: 'User',
    site_admin: false,
    name: 'Test User',
    company: 'Test Company',
    blog: 'https://testuser.com',
    location: 'Seoul, Korea',
    email: null,
    hireable: null,
    bio: 'This is a test bio',
    twitter_username: null,
    public_repos: 42,
    public_gists: 5,
    followers: 100,
    following: 50,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    score: 1.0,
  }

  describe('렌더링 - 성공 케이스', () => {
    it('모든 데이터가 있을 때 사용자 카드를 렌더링해야 한다', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('@testuser')).toBeInTheDocument()
      expect(screen.getByText('This is a test bio')).toBeInTheDocument()
      expect(screen.getByText('Seoul, Korea')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      expect(screen.getByText(/100/)).toBeInTheDocument()
      expect(screen.getByText(/followers/)).toBeInTheDocument()
      expect(screen.getByText(/42/)).toBeInTheDocument()
      expect(screen.getByText(/repos/)).toBeInTheDocument()
    })

    it('아바타 이미지가 올바른 src와 alt를 가져야 한다', () => {
      render(<UserCard user={mockUser} />)

      const avatar = screen.getByTestId('user-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute(
        'data-src',
        'https://avatars.githubusercontent.com/u/1'
      )
      expect(avatar).toHaveAttribute('data-alt', 'testuser')
      expect(avatar).toHaveAttribute('data-size', '64')
    })

    it('GitHub 프로필로 이동하는 링크가 있어야 한다', () => {
      render(<UserCard user={mockUser} />)

      const link = screen.getByRole('link', { name: /Test User/ })
      expect(link).toHaveAttribute('href', 'https://github.com/testuser')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('User 타입 칩을 렌더링해야 한다', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('User')).toBeInTheDocument()
    })

    it('Organization 타입 칩을 렌더링해야 한다', () => {
      const orgUser: GitHubUser = {
        ...mockUser,
        type: 'Organization',
      }

      render(<UserCard user={orgUser} />)

      expect(screen.getByText('Organization')).toBeInTheDocument()
    })
  })

  describe('데이터 표시 안전성 - 누락된 필드', () => {
    it('이름이 없으면 로그인명을 fallback으로 사용해야 한다', () => {
      const userWithoutName: GitHubUser = {
        ...mockUser,
        name: null,
      }

      render(<UserCard user={userWithoutName} />)

      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('bio가 없으면 표시하지 않아야 한다', () => {
      const userWithoutBio: GitHubUser = {
        ...mockUser,
        bio: null,
      }

      render(<UserCard user={userWithoutBio} />)

      expect(screen.queryByText('This is a test bio')).not.toBeInTheDocument()
    })

    it('location이 없으면 표시하지 않아야 한다', () => {
      const userWithoutLocation: GitHubUser = {
        ...mockUser,
        location: null,
      }

      render(<UserCard user={userWithoutLocation} />)

      expect(screen.queryByText('Seoul, Korea')).not.toBeInTheDocument()
    })

    it('company가 없으면 표시하지 않아야 한다', () => {
      const userWithoutCompany: GitHubUser = {
        ...mockUser,
        company: null,
      }

      render(<UserCard user={userWithoutCompany} />)

      expect(screen.queryByText('Test Company')).not.toBeInTheDocument()
    })

    it('팔로워가 0명이어도 표시해야 한다', () => {
      const userWithZeroFollowers: GitHubUser = {
        ...mockUser,
        followers: 0,
      }

      render(<UserCard user={userWithZeroFollowers} />)

      expect(screen.getByText(/0/)).toBeInTheDocument()
      expect(screen.getByText(/followers/)).toBeInTheDocument()
    })

    it('리포지토리가 0개여도 표시해야 한다', () => {
      const userWithZeroRepos: GitHubUser = {
        ...mockUser,
        public_repos: 0,
      }

      const { container } = render(<UserCard user={userWithZeroRepos} />)

      expect(screen.getByText('repos')).toBeInTheDocument()
      expect(container.textContent).toContain('0 repos')
    })

    it('최소한의 데이터만 있어도 렌더링되어야 한다', () => {
      const minimalUser: GitHubUser = {
        id: 999,
        login: 'minimaluser',
        node_id: 'MDQ6VXNlcjk5OQ==',
        avatar_url: 'https://example.com/avatar.png',
        gravatar_id: null,
        url: 'https://api.github.com/users/minimaluser',
        html_url: 'https://github.com/minimaluser',
        type: 'User',
        site_admin: false,
        name: null,
        company: null,
        blog: null,
        location: null,
        email: null,
        hireable: null,
        bio: null,
        twitter_username: null,
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        score: 1.0,
      }

      const { container } = render(<UserCard user={minimalUser} />)

      expect(screen.getByText('minimaluser')).toBeInTheDocument()
      expect(screen.getByText('@minimaluser')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(container.textContent).toContain('0 followers')
      expect(container.textContent).toContain('0 repos')

      // 선택 필드는 표시되지 않음
      expect(
        screen.queryByRole('img', { name: /location/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('img', { name: /business/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('데이터 표시 안전성 - Edge Cases', () => {
    it('매우 긴 이름을 처리할 수 있어야 한다', () => {
      const userWithLongName: GitHubUser = {
        ...mockUser,
        name: 'A'.repeat(100),
      }

      render(<UserCard user={userWithLongName} />)

      const nameElement = screen.getByText('A'.repeat(100))
      expect(nameElement).toBeInTheDocument()
    })

    it('매우 긴 bio를 처리할 수 있어야 한다', () => {
      const longBio = 'This is a very long bio. '.repeat(20)
      const userWithLongBio: GitHubUser = {
        ...mockUser,
        bio: longBio,
      }

      render(<UserCard user={userWithLongBio} />)

      expect(screen.getByText(/This is a very long bio/)).toBeInTheDocument()
    })

    it('로그인명에 특수문자가 있어도 처리할 수 있어야 한다', () => {
      const userWithSpecialChars: GitHubUser = {
        ...mockUser,
        login: 'test-user_123',
      }

      render(<UserCard user={userWithSpecialChars} />)

      expect(screen.getByText('@test-user_123')).toBeInTheDocument()
    })

    it('매우 많은 팔로워 수를 처리할 수 있어야 한다', () => {
      const userWithManyFollowers: GitHubUser = {
        ...mockUser,
        followers: 1234567,
      }

      render(<UserCard user={userWithManyFollowers} />)

      expect(screen.getByText(/1234567/)).toBeInTheDocument()
    })

    it('매우 많은 리포지토리 수를 처리할 수 있어야 한다', () => {
      const userWithManyRepos: GitHubUser = {
        ...mockUser,
        public_repos: 9999,
      }

      render(<UserCard user={userWithManyRepos} />)

      expect(screen.getByText(/9999/)).toBeInTheDocument()
    })

    it('빈 문자열 location을 처리할 수 있어야 한다', () => {
      const userWithEmptyLocation: GitHubUser = {
        ...mockUser,
        location: '',
      }

      render(<UserCard user={userWithEmptyLocation} />)

      // 빈 문자열은 falsy로 처리되어 표시되지 않음
      expect(screen.queryByText('Seoul, Korea')).not.toBeInTheDocument()
    })

    it('빈 문자열 company를 처리할 수 있어야 한다', () => {
      const userWithEmptyCompany: GitHubUser = {
        ...mockUser,
        company: '',
      }

      render(<UserCard user={userWithEmptyCompany} />)

      // 빈 문자열은 falsy로 처리되어 표시되지 않음
      expect(screen.queryByText('Test Company')).not.toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('링크가 접근 가능해야 한다', () => {
      render(<UserCard user={mockUser} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href')
      expect(link).toHaveAccessibleName()
    })

    it('아바타 이미지가 접근 가능해야 한다', () => {
      render(<UserCard user={mockUser} />)

      const avatar = screen.getByTestId('user-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('data-alt', 'testuser')
    })
  })

  describe('커스텀 스타일', () => {
    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <UserCard user={mockUser} className="custom-class" />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })

  describe('XSS 방어', () => {
    it('이름에 HTML entities가 있어도 안전하게 렌더링해야 한다', () => {
      const userWithHtmlInName: GitHubUser = {
        ...mockUser,
        name: '<script>alert("xss")</script>',
      }

      render(<UserCard user={userWithHtmlInName} />)

      expect(
        screen.getByText('<script>alert("xss")</script>')
      ).toBeInTheDocument()
      expect(document.querySelector('script')).not.toBeInTheDocument()
    })

    it('bio에 HTML entities가 있어도 안전하게 렌더링해야 한다', () => {
      const userWithHtmlInBio: GitHubUser = {
        ...mockUser,
        bio: '<img src=x onerror=alert(1)>',
      }

      render(<UserCard user={userWithHtmlInBio} />)

      expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
    })

    it('location에 HTML entities가 있어도 안전하게 렌더링해야 한다', () => {
      const userWithHtmlInLocation: GitHubUser = {
        ...mockUser,
        location: '<b>Seoul</b>',
      }

      render(<UserCard user={userWithHtmlInLocation} />)

      expect(screen.getByText('<b>Seoul</b>')).toBeInTheDocument()
      // <b> 태그가 실제로 적용되지 않음
      const boldElement = screen.queryByRole('generic', { name: /Seoul/ })
      expect(boldElement?.tagName).not.toBe('B')
    })

    it('company에 HTML entities가 있어도 안전하게 렌더링해야 한다', () => {
      const userWithHtmlInCompany: GitHubUser = {
        ...mockUser,
        company: '<div>Evil Corp</div>',
      }

      render(<UserCard user={userWithHtmlInCompany} />)

      expect(screen.getByText('<div>Evil Corp</div>')).toBeInTheDocument()
    })
  })

  describe('실패 케이스', () => {
    it('잘못된 avatar URL이어도 렌더링되어야 한다', () => {
      const userWithInvalidAvatar: GitHubUser = {
        ...mockUser,
        avatar_url: 'invalid-url',
      }

      render(<UserCard user={userWithInvalidAvatar} />)

      const avatar = screen.getByTestId('user-avatar')
      expect(avatar).toHaveAttribute('data-src', 'invalid-url')
    })

    it('잘못된 profile URL이어도 렌더링되어야 한다', () => {
      const userWithInvalidUrl: GitHubUser = {
        ...mockUser,
        html_url: 'not-a-valid-url',
      }

      render(<UserCard user={userWithInvalidUrl} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'not-a-valid-url')
    })

    it('음수 팔로워 수도 표시해야 한다', () => {
      const userWithNegativeFollowers: GitHubUser = {
        ...mockUser,
        followers: -1,
      }

      render(<UserCard user={userWithNegativeFollowers} />)

      expect(screen.getByText(/-1/)).toBeInTheDocument()
    })

    it('음수 리포지토리 수도 표시해야 한다', () => {
      const userWithNegativeRepos: GitHubUser = {
        ...mockUser,
        public_repos: -1,
      }

      const { container } = render(<UserCard user={userWithNegativeRepos} />)

      expect(container.textContent).toContain('-1 repos')
    })
  })
})
