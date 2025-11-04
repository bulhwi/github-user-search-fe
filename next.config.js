/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // WASM 지원 설정
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // .wasm 파일 처리
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
}

module.exports = nextConfig