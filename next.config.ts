import type { NextConfig } from "next";

// GitHub Pages 정적 배포 호환 설정.
// - basePath/assetPrefix: project pages 의 subpath (/hello-project) 를 환경변수로 받음.
//   로컬 dev/build 에서는 비어 있어야 함 (`/` 루트로 동작).
// - trailingSlash: GitHub Pages 의 디렉토리 라우팅 친화 (`/timeline` → `/timeline/index.html`).
// - images.unoptimized: `output: 'export'` 와 default Image Optimization 은 호환 안 됨.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
