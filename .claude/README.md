# Claude Code 설정 가이드

이 디렉토리는 Claude Code의 프로젝트별 설정을 포함합니다.

## 설정 파일

### settings.json

프로젝트의 Claude Code 공유 설정 파일입니다.
- 프로젝트 팀원들과 공유되는 설정
- Git에 커밋되어 모든 팀원에게 적용
- 개인 설정은 `settings.local.json`에 작성 (Git 무시됨)

#### Permissions (권한)

자동으로 허용되는 명령어:
- `gh issue create:*` - GitHub Issues 생성
- `pnpm install:*` - pnpm 패키지 설치

#### Hooks (자동화)

**UserPromptSubmit Hook**
- 사용자가 프롬프트를 제출할 때마다 자동으로 실행됩니다
- `.claude/prompt_log.txt`에 타임스탬프를 기록합니다
- `used_prompts.md` 업데이트가 필요함을 리마인더합니다

**⚠️ 중요한 한계점:**
- Hook은 **프롬프트의 실제 내용에 접근할 수 없습니다**
- 타임스탬프만 자동으로 기록됩니다
- **실제 프롬프트 내용은 Claude Code가 수동으로 `prompts/used_prompts.md`에 기록합니다**

## 작동 방식

1. 사용자가 프롬프트를 제출
2. Hook이 자동 실행 → `.claude/prompt_log.txt`에 타임스탬프 기록
3. Claude Code가 대화 내용을 분석하여 `prompts/used_prompts.md`에 상세 기록
4. 프롬프트 번호, 내용, 결과를 포맷에 맞춰 문서화

## 로그 파일

### prompt_log.txt
- 프롬프트 제출 타임스탬프 자동 기록
- Hook에 의해 자동 생성
- 형식: `[프롬프트 제출] YYYY-MM-DD HH:MM:SS - used_prompts.md 업데이트 필요`

## 참고

- [Claude Code 공식 문서](https://docs.claude.com/claude-code)
- [Hooks 가이드](https://docs.claude.com/claude-code/hooks)
