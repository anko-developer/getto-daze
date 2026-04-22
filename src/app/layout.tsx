import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'getto daze — 유기동물 입양',
  description: '지역 기반 유기동물 검색, AI 매칭, 입양 안내',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-[#222222]" suppressHydrationWarning>
        <header className="sticky top-0 z-50 bg-white border-b border-[#dddddd]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-[#ff385c] font-bold text-xl tracking-tight">
              getto daze
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/match"
                className="text-sm font-medium text-[#222222] hover:text-[#ff385c] transition-colors"
              >
                AI 매칭
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-[#222222] hover:text-[#ff385c] transition-colors"
              >
                입양 상담
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
