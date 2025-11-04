/**
 * Popular Programming Languages for GitHub Search
 *
 * 인기 프로그래밍 언어 목록
 * GitHub Search API에서 사용 가능한 주요 언어들
 */
export const POPULAR_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'C',
  'Shell',
  'HTML',
  'CSS',
  'Dart',
  'Scala',
  'R',
  'Objective-C',
] as const

export type PopularLanguage = (typeof POPULAR_LANGUAGES)[number]
