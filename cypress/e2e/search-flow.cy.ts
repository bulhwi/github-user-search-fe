/// <reference types="cypress" />

describe('검색 플로우 테스트', () => {
  beforeEach(() => {
    // API 인터셉트 설정
    cy.interceptGitHubAPI()
    cy.visitHome()
  })

  describe('초기 화면 렌더링', () => {
    it('페이지 제목이 표시되어야 한다', () => {
      cy.contains('h1', 'GitHub User Search').should('be.visible')
    })

    it('검색 바가 표시되어야 한다', () => {
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })

    it('검색 버튼이 표시되어야 한다', () => {
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('필터 패널이 표시되어야 한다', () => {
      cy.contains('Filters').should('be.visible')
    })

    it('초기 상태에서는 검색 결과가 없어야 한다', () => {
      cy.get('[data-testid="user-card"]').should('not.exist')
    })
  })

  describe('검색어 입력 및 제출', () => {
    it('검색어를 입력할 수 있어야 한다', () => {
      const searchQuery = 'test'
      cy.get('input[placeholder*="Search"]').type(searchQuery)
      cy.get('input[placeholder*="Search"]').should('have.value', searchQuery)
    })

    it('Enter 키로 검색을 실행할 수 있어야 한다', () => {
      cy.get('input[placeholder*="Search"]').type('test{enter}')
      cy.wait('@searchAPI')
    })

    it('검색 버튼 클릭으로 검색을 실행할 수 있어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@searchAPI')
    })

    it('빈 검색어는 검색을 실행하지 않아야 한다', () => {
      cy.get('button[type="submit"]').click()
      cy.get('@searchAPI.all').should('have.length', 0)
    })

    it('검색어를 지우고 다시 입력할 수 있어야 한다', () => {
      cy.get('input[placeholder*="Search"]').type('first')
      cy.get('input[placeholder*="Search"]').clear()
      cy.get('input[placeholder*="Search"]').type('second')
      cy.get('input[placeholder*="Search"]').should('have.value', 'second')
    })
  })

  describe('검색 결과 표시', () => {
    beforeEach(() => {
      // Mock 데이터로 테스트
      cy.interceptGitHubAPI('search-results.json')
    })

    it('검색 후 결과가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()
      cy.get('[data-testid="user-card"]').should('have.length.gt', 0)
    })

    it('사용자 카드에 필수 정보가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]').first().within(() => {
        // 아바타 이미지
        cy.get('img').should('be.visible')
        // 사용자 이름
        cy.get('a').should('have.attr', 'href').and('include', 'github.com')
        // 타입 정보
        cy.contains(/User|Organization/).should('be.visible')
      })
    })

    it('검색 결과 개수가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()
      cy.contains(/\d+ results?/i).should('be.visible')
    })

    it('사용자 카드 클릭 시 새 탭에서 GitHub 프로필이 열려야 한다', () => {
      cy.searchUsers('test')
      cy.wait('@searchAPI')
      cy.waitForResults()

      cy.get('[data-testid="user-card"]')
        .first()
        .find('a')
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
    })
  })

  describe('Loading 상태', () => {
    beforeEach(() => {
      // API 응답을 지연시켜 로딩 상태 테스트
      cy.intercept('GET', '/api/search*', (req) => {
        req.reply((res) => {
          res.delay = 1000 // 1초 지연
        })
      }).as('searchAPI')
    })

    it('검색 중 로딩 인디케이터가 표시되어야 한다', () => {
      cy.searchUsers('test')
      cy.get('[role="progressbar"]').should('be.visible')
      cy.wait('@searchAPI')
      cy.get('[role="progressbar"]').should('not.exist')
    })

    it('로딩 중에는 검색 버튼이 비활성화되어야 한다', () => {
      cy.searchUsers('test')
      cy.get('button[type="submit"]').should('be.disabled')
      cy.wait('@searchAPI')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })
  })

  describe('빈 결과 처리', () => {
    beforeEach(() => {
      // 빈 결과 Mock
      cy.intercept('GET', '/api/search*', {
        statusCode: 200,
        body: {
          items: [],
          total_count: 0,
          incomplete_results: false,
        },
      }).as('searchAPI')
    })

    it('결과가 없을 때 메시지가 표시되어야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjklzxcvbnm')
      cy.wait('@searchAPI')
      cy.contains(/no users found|no results/i).should('be.visible')
    })

    it('결과가 없을 때 사용자 카드가 표시되지 않아야 한다', () => {
      cy.searchUsers('qwertyuiopasdfghjklzxcvbnm')
      cy.wait('@searchAPI')
      cy.get('[data-testid="user-card"]').should('not.exist')
    })
  })

  describe('검색 히스토리', () => {
    it('이전 검색어가 유지되어야 한다', () => {
      cy.searchUsers('first-search')
      cy.wait('@searchAPI')
      cy.get('input[placeholder*="Search"]').should('have.value', 'first-search')

      cy.searchUsers('second-search')
      cy.wait('@searchAPI')
      cy.get('input[placeholder*="Search"]').should('have.value', 'second-search')
    })
  })
})
