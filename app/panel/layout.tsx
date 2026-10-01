import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-cream">{children}</div>
}
