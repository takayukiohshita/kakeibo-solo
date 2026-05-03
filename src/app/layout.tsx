import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '家計ノート',
  description: 'ひとり暮らし向け家計管理アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
