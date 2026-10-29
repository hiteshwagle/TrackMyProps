import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'TrackMyProps — Your portfolio, in perspective',
  description:
    'A clearer picture of your Australian property portfolio. Track properties, understand equity, and bring income and expenses together.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
