interface FaviconPreviewProps {
  size: number;
}

export function FaviconPreview({ size }: FaviconPreviewProps) {
  const scale = size / 64;
  const strokeWidth = Math.max(2, 4 / scale);

  // 方案 A: 数据库 + 放大镜
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="url(#gradient-a)" />
      
      {/* 数据库 */}
      <ellipse cx="26" cy="20" rx="12" ry="5" stroke="white" strokeWidth={strokeWidth} />
      <path d="M14 20v16c0 2.76 5.37 5 12 5s12-2.24 12-5V20" stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M14 28c0 2.76 5.37 5 12 5s12-2.24 12-5" stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" />
      
      {/* 放大镜 */}
      <circle cx="44" cy="44" r="8" stroke="white" strokeWidth={strokeWidth} fill="none" />
      <path d="M50 50l6 6" stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" />
      
      <defs>
        <linearGradient id="gradient-a" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0891b2" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
