import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f1117',
};

export const metadata: Metadata = {
  title: {
    default: 'LLM Inference Logger',
    template: '%s | LLM Inference Logger',
  },
  description: 'LLM observability — chat, streaming inference logs, and metrics dashboard',
  applicationName: 'LLM Inference Logger',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
