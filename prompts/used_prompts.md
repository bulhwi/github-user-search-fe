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