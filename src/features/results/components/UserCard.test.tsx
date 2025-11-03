import { render, screen } from '@testing-library/react'
import { UserCard } from './UserCard'
import type { GitHubUser } from '@/types'

describe('UserCard', () => {
  const mockUser: GitHubUser = {
    id: 1,
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/testuser',
    type: 'User',
    name: 'Test User',
    company: 'Test Company',
    blog: 'https://testuser.com',
    location: 'Seoul, Korea',
    email: null,
    bio: 'This is a test bio',
    public_repos: 42,
    followers: 100,
    following: 50,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  describe('Rendering', () => {
    it('should render user card with all data', () => {
      render(<UserCard user={mockUser} />)

      // Name 표시
      expect(screen.getByText('Test User')).toBeInTheDocument()
      // Login 표시
      expect(screen.getByText('@testuser')).toBeInTheDocument()
      // Bio 표시
      expect(screen.getByText('This is a test bio')).toBeInTheDocument()
      // Location 표시
      expect(screen.getByText('Seoul, Korea')).toBeInTheDocument()
      // Company 표시
      expect(screen.getByText('Test Company')).toBeInTheDocument()
      // Followers 표시
      expect(screen.getByText(/100/)).toBeInTheDocument()
      expect(screen.getByText(/followers/)).toBeInTheDocument()
      // Repos 표시
      expect(screen.getByText(/42/)).toBeInTheDocument()
      expect(screen.getByText(/repos/)).toBeInTheDocument()
    })

    it('should render avatar with correct src and alt', () => {
      render(<UserCard user={mockUser} />)

      const avatar = screen.getByAltText('testuser')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute(
        'src',
        'https://avatars.githubusercontent.com/u/1'
      )
    })

    it('should render link to GitHub profile', () => {
      render(<UserCard user={mockUser} />)

      const link = screen.getByRole('link', { name: /Test User/ })
      expect(link).toHaveAttribute('href', 'https://github.com/testuser')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render User type chip', () => {
      render(<UserCard user={mockUser} />)

      expect(screen.getByText('User')).toBeInTheDocument()
    })

    it('should render Organization type chip', () => {
      const orgUser: GitHubUser = {
        ...mockUser,
        type: 'Organization',
      }

      render(<UserCard user={orgUser} />)

      expect(screen.getByText('Organization')).toBeInTheDocument()
    })
  })

  describe('Data Display Safety - Missing Fields', () => {
    it('should handle missing name (fallback to login)', () => {
      const userWithoutName: GitHubUser = {
        ...mockUser,
        name: null,
      }

      render(<UserCard user={userWithoutName} />)

      // name이 없으면 login을 표시
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('should handle missing bio', () => {
      const userWithoutBio: GitHubUser = {
        ...mockUser,
        bio: null,
      }

      render(<UserCard user={userWithoutBio} />)

      // bio가 없으면 표시하지 않음
      expect(screen.queryByText('This is a test bio')).not.toBeInTheDocument()
    })

    it('should handle missing location', () => {
      const userWithoutLocation: GitHubUser = {
        ...mockUser,
        location: null,
      }

      render(<UserCard user={userWithoutLocation} />)

      // location이 없으면 표시하지 않음
      expect(screen.queryByText('Seoul, Korea')).not.toBeInTheDocument()
    })

    it('should handle missing company', () => {
      const userWithoutCompany: GitHubUser = {
        ...mockUser,
        company: null,
      }

      render(<UserCard user={userWithoutCompany} />)

      // company가 없으면 표시하지 않음
      expect(screen.queryByText('Test Company')).not.toBeInTheDocument()
    })

    it('should handle zero followers', () => {
      const userWithZeroFollowers: GitHubUser = {
        ...mockUser,
        followers: 0,
      }

      render(<UserCard user={userWithZeroFollowers} />)

      expect(screen.getByText(/0/)).toBeInTheDocument()
      expect(screen.getByText(/followers/)).toBeInTheDocument()
    })

    it('should handle zero repos', () => {
      const userWithZeroRepos: GitHubUser = {
        ...mockUser,
        public_repos: 0,
      }

      const { container } = render(<UserCard user={userWithZeroRepos} />)

      expect(screen.getByText('repos')).toBeInTheDocument()
      expect(container.textContent).toContain('0 repos')
    })

    it('should handle minimal user data', () => {
      const minimalUser: GitHubUser = {
        id: 999,
        login: 'minimaluser',
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/minimaluser',
        type: 'User',
        name: null,
        company: null,
        blog: null,
        location: null,
        email: null,
        bio: null,
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const { container } = render(<UserCard user={minimalUser} />)

      // 필수 필드만 표시
      expect(screen.getByText('minimaluser')).toBeInTheDocument()
      expect(screen.getByText('@minimaluser')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(container.textContent).toContain('0 followers')
      expect(container.textContent).toContain('0 repos')

      // 선택 필드는 표시되지 않음
      expect(screen.queryByRole('img', { name: /location/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('img', { name: /business/i })).not.toBeInTheDocument()
    })
  })

  describe('Data Display Safety - Edge Cases', () => {
    it('should handle very long names', () => {
      const userWithLongName: GitHubUser = {
        ...mockUser,
        name: 'A'.repeat(100),
      }

      render(<UserCard user={userWithLongName} />)

      // noWrap 속성으로 텍스트가 잘림
      const nameElement = screen.getByText('A'.repeat(100))
      expect(nameElement).toBeInTheDocument()
    })

    it('should handle very long bio', () => {
      const longBio = 'This is a very long bio. '.repeat(20)
      const userWithLongBio: GitHubUser = {
        ...mockUser,
        bio: longBio,
      }

      render(<UserCard user={userWithLongBio} />)

      // WebkitLineClamp으로 2줄로 제한 (부분 텍스트로 검증)
      expect(screen.getByText(/This is a very long bio/)).toBeInTheDocument()
    })

    it('should handle special characters in login', () => {
      const userWithSpecialChars: GitHubUser = {
        ...mockUser,
        login: 'test-user_123',
      }

      render(<UserCard user={userWithSpecialChars} />)

      expect(screen.getByText('@test-user_123')).toBeInTheDocument()
    })

    it('should handle large numbers for followers', () => {
      const userWithManyFollowers: GitHubUser = {
        ...mockUser,
        followers: 1234567,
      }

      render(<UserCard user={userWithManyFollowers} />)

      expect(screen.getByText(/1234567/)).toBeInTheDocument()
    })

    it('should handle large numbers for repos', () => {
      const userWithManyRepos: GitHubUser = {
        ...mockUser,
        public_repos: 9999,
      }

      render(<UserCard user={userWithManyRepos} />)

      expect(screen.getByText(/9999/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible link', () => {
      render(<UserCard user={mockUser} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href')
      expect(link).toHaveAccessibleName()
    })

    it('should have accessible avatar', () => {
      render(<UserCard user={mockUser} />)

      const avatar = screen.getByAltText('testuser')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <UserCard user={mockUser} className="custom-class" />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })

  describe('XSS Prevention', () => {
    it('should safely render HTML entities in name', () => {
      const userWithHtmlInName: GitHubUser = {
        ...mockUser,
        name: '<script>alert("xss")</script>',
      }

      render(<UserCard user={userWithHtmlInName} />)

      // React는 자동으로 HTML을 이스케이프함
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument()
      expect(document.querySelector('script')).not.toBeInTheDocument()
    })

    it('should safely render HTML entities in bio', () => {
      const userWithHtmlInBio: GitHubUser = {
        ...mockUser,
        bio: '<img src=x onerror=alert(1)>',
      }

      render(<UserCard user={userWithHtmlInBio} />)

      expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
      // img 태그가 실제로 렌더링되지 않음
    })
  })
})
