# AI 프롬프트 기록

이 문서는 프로젝트 개발 과정에서 사용된 모든 AI 프롬프트를 기록합니다.

## 날짜: 2025-11-03

### 프롬프트 1: 프로젝트 초기 설정
**사용한 도구**: Claude Code

**프롬프트**:
```
현재 내가 업로드한 pdf파일 읽고 분석해봐
```

**결과**:
- PDF 파일 분석 완료
- 과제 요구사항 파악

---

### 프롬프트 2: 프로젝트 구조 설정
**사용한 도구**: Claude Code

**프롬프트**:
```
claude.md 파일을 업데이트하고, 프로젝트 구조도 설정해,
그리고 진행할 작업에 대해서 prd문서 포맷으로 추가로 정리해줘
```

**결과**:
- CLAUDE.md 파일 업데이트 완료 (과제 요구사항 상세 반영)
- Next.js 프로젝트 초기화 및 의존성 설치 완료
  - Next.js 14.2.15, React 18.3.1, TypeScript 5.9.3
  - MUI 6.5.0, Redux Toolkit 2.9.2, Tailwind CSS 3.4.18
  - Jest 29.7.0, Cypress 13.17.0
- 프로젝트 디렉토리 구조 생성 완료
  - src/app, src/features, src/shared, src/store, src/types
- 설정 파일들 생성
  - tsconfig.json (strict mode, ES2023)
  - tailwind.config.ts (MUI 호환 설정)
  - .eslintrc.json, .prettierrc
  - jest.config.js, cypress.config.ts
  - next.config.js (GitHub 아바타 도메인 설정)
- Redux store 기본 설정 완료
- MUI + Tailwind CSS 통합 설정 완료 (Providers with ThemeProvider)
- PRD.md 문서 작성 완료 (상세한 기술 명세 및 개발 계획)
- prompts/used_prompts.md 초기 생성

---

### 프롬프트 3: 문서 구조 정리
**사용한 도구**: Claude Code

**프롬프트**:
```
시작하기 이전에 PRD.md,Hiring Assignment_웹 프론트엔드 엔지니어.pdf 문서는 docs 하위로 옮기자
```

**결과**:
- docs/ 디렉토리 생성
- PRD.md를 docs/PRD.md로 이동
- Hiring Assignment_웹 프론트엔드 엔지니어.pdf를 docs/로 이동
- CLAUDE.md에 PRD.md 위치 참조 추가

---

### 프롬프트 4: AI 프롬프트 자동 기록 확인
**사용한 도구**: Claude Code

**프롬프트**:
```
그전에 used_prompts.md에 너랑 내가 주고받은 프롬프트 자동으로 계속 업데이트 하는거 까먹지마
```

**결과**:
- used_prompts.md 업데이트 (프롬프트 3, 4 추가)
- 앞으로 모든 대화 내용을 자동으로 기록하기로 확인

---

### 프롬프트 5: 깃헙 푸시 및 테크스펙 문서 작성
**사용한 도구**: Claude Code

**프롬프트**:
```
현재 상태로 깃헙에 푸시하고, 작업하기 이전에 현재까지 적립된 내용을 기반으로 테크스펙동 정리해서 별도 문서로 정리해보자
문서이름은 니가 정하고 docs/ 하위에 위치시켜
```

**결과**:
- Git 커밋 및 푸시 완료
  - 커밋 메시지: "chore: initial project setup with Next.js, TypeScript, MUI, and Tailwind CSS"
  - 22개 파일 추가 (8,937 insertions)
  - 원격 저장소(origin/main)에 푸시 완료
- docs/TECHNICAL_SPECIFICATION.md 문서 작성 완료
  - 전체 시스템 아키텍처 설계
  - 기술 스택 상세 명세
  - 데이터 모델 및 TypeScript 타입 정의
  - API 설계 (Server Route + Client API)
  - Redux 상태 관리 설계 (Search Slice + UI Slice)
  - SSR/CSR 렌더링 전략
  - 검색 쿼리 빌더 구현 명세 (8가지 필터)
  - Canvas + WebAssembly 이미지 처리 설계
  - 성능 최적화 전략
  - 보안 고려사항
  - 테스트 전략 (Unit + Component + E2E)
  - 배포 전략 (Vercel)

---

### 프롬프트 6: 아키텍처 변경 (Atomic Design + React Query)
**사용한 도구**: Claude Code

**프롬프트**:
```
UI 디자인 패턴은 아토믹 패턴 상태관리는 react query와 context api만을 사용해서 구현할거야.
이내용도 prd와 테크스펙 문서에 적절히 정리해서 업데이트하고, 필요한 라이브러리들 추가로 인스톨 진행해
```

**결과**:
- 아키텍처 대규모 변경 (Redux Toolkit → React Query + Context API, Clean Architecture → Atomic Design Pattern)
- package.json 수정
  - Redux Toolkit, React Redux 제거
  - @tanstack/react-query@5.90.6 추가
  - @tanstack/react-query-devtools@5.90.2 추가
  - axios@1.13.1 추가
- pnpm install 실행 (의존성 업데이트 완료)
- docs/PRD.md 업데이트
  - 기술 스택 섹션: Redux Toolkit → React Query + Context API + Axios
  - 디자인 패턴: Atomic Design Pattern 추가
  - 디렉토리 구조: Atomic Design 기반으로 재설계
  - 데이터 플로우: Context API + React Query 기반으로 변경
  - 상태 관리: React Query (서버 상태) + Context API (클라이언트 상태)
  - 참고 자료: React Query, Atomic Design 추가
  - 변경 이력: v1.1.0 추가
- docs/TECHNICAL_SPECIFICATION.md 업데이트
  - 버전: v2.0.0으로 업그레이드
  - 중요 업데이트 알림 추가 (상단)
  - 기술 스택: React Query + Context API + Axios로 변경
  - 기술적 목표: Atomic Design Pattern 기반 모듈화로 변경
  - 변경 이력: v2.0.0 추가
- src/app/providers.tsx 업데이트
  - Redux Provider → QueryClientProvider로 변경
  - React Query DevTools 추가
  - Query Client 기본 옵션 설정 (staleTime, retry 등)
- 기존 Redux 관련 디렉토리 삭제
  - src/store/ 삭제
  - src/features/ 삭제 (Atomic Design으로 재구성 예정)
  - src/shared/ 삭제 (Atomic Design으로 재구성 예정)

---

### 프롬프트 7: Git 커밋 및 푸시 완료 (세션 연속)
**사용한 도구**: Claude Code

**프롬프트**:
```
[세션 컨텍스트 초과로 인한 자동 재시작 및 작업 계속]
```

**결과**:
- Git 커밋 완료
  - 커밋 메시지: "refactor: migrate from Redux to React Query + Context API, adopt Atomic Design pattern"
  - 커밋 해시: 2cf3049
  - 7개 파일 변경 (245 insertions, 193 deletions)
  - src/store/index.ts 삭제 완료
- Git 푸시 완료
  - 원격 저장소(origin/main)에 푸시 성공
  - 커밋 범위: 14e3302..2cf3049
- Todo 리스트 업데이트 (모든 작업 완료 처리)

---

### 프롬프트 8: Axios 제거, Native Fetch API 사용
**사용한 도구**: Claude Code

**프롬프트**:
```
다 좋은데, axios는 쓰지말자, javascript fetch api로도 충분해.
axios 제거해
```

**결과**:
- package.json에서 axios 제거 완료
- pnpm install 실행 (axios 1.13.1 제거됨)
- docs/PRD.md 업데이트
  - HTTP Client: Axios → Native Fetch API로 변경
- docs/TECHNICAL_SPECIFICATION.md 업데이트
  - HTTP Client: Axios → Fetch API (Native)로 변경
  - 버전 이력 추가: v2.1.0 (HTTP Client 변경)
- 아키텍처 방향: 외부 라이브러리 최소화, 브라우저 네이티브 API 활용

---

### 프롬프트 9: PDF 요구사항 준수를 위한 Redux Toolkit 회귀
**사용한 도구**: Claude Code

**프롬프트**:
```
좋아, 작업진행전 기반작업은 끝난거 같은데 시작전에 prd, pdf, 테크스펙 등을 다시 분석 비교해서 놓친게 있는지, pdf에서의 요구사항과 다른게 있는지 다시 체크해보자
→ 원본데로 1번으로 진행하자. used_prompts.md도 업데이트 자동으로 계속 해
```

**결과**:
- 📋 **PDF vs PRD/Tech Spec 비교 분석 완료**
  - PDF 원본은 "Redux Toolkit" 명시적 요구
  - 현재 코드: React Query + Context API로 구현되어 있음 (불일치 발견)
  - Technical Specification: Redux 기반으로 작성되어 있으나 실제 코드와 불일치

- 🔄 **PDF 요구사항 준수를 위한 아키텍처 복원**
  - package.json 수정
    - React Query (@tanstack/react-query, react-query-devtools) 제거
    - @reduxjs/toolkit@2.9.2 추가
    - react-redux@9.2.0 추가
  - pnpm install 실행 (의존성 재구성 완료)

- 📝 **providers.tsx 수정**
  - QueryClientProvider → Redux Provider로 변경
  - React Query DevTools 제거
  - Redux Store import 추가 (@/store)

- 📄 **docs/PRD.md 전면 업데이트 (v3.0.0)**
  - 상태 관리: React Query + Context API → Redux Toolkit
  - 데이터 플로우: Redux Action Dispatch → Redux Thunk → Redux Store Update
  - State Management 섹션: Redux Toolkit 중심으로 재작성
  - 디렉토리 구조: contexts/ 제거, store/ 추가
  - hooks/queries/ 제거
  - Day 1 체크리스트: Redux Toolkit 설정으로 변경
  - 변경 이력: v3.0.0 추가 (PDF 요구사항 준수)

- 📘 **docs/TECHNICAL_SPECIFICATION.md 업데이트 (v3.0.0)**
  - 버전: v3.0.0으로 업데이트
  - 상단 경고 메시지 수정: Redux Toolkit 기반 강조
  - 기술적 목표: React Query → Redux Toolkit 설명
  - State Management 섹션: Redux Toolkit 2.9.2, react-redux 9.2.0 명시
  - 최적화 전략: React Query → Redux Thunk + Manual Cache
  - 변경 이력: v3.0.0 추가

- ✅ **아키텍처 정렬 완료**
  - PDF 요구사항 ✓
  - PRD.md ✓
  - Technical Specification ✓
  - 실제 코드 (providers.tsx) ✓
  - package.json ✓
  - 모든 문서와 코드가 Redux Toolkit 기반으로 통일됨

---

## 작성 가이드

각 프롬프트 기록은 다음 형식을 따라 작성합니다:

```markdown
### 프롬프트 N: [작업 제목]
**사용한 도구**: [ChatGPT/Claude/기타]

**프롬프트**:
[실제 사용한 프롬프트 내용]

**결과**:
- [구현된 기능이나 변경사항 1]
- [구현된 기능이나 변경사항 2]
```

---