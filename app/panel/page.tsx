import type { Metadata } from 'next'
import { PanelApp } from '@/components/panel-app'
import { databaseMode, getCatalog } from '@/lib/store'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Panel właściciela',
  robots: { index: false, follow: false },
}

export default async function PanelPage() {
  const catalog = await getCatalog()
  return <PanelApp initial={catalog} mode={databaseMode()} />
}
