import './globals.css'

export const metadata = {
  title: 'Dashboard Báo Cáo',
  description: 'Quản lý và nhắc việc báo cáo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body>{children}</body>
    </html>
  )
}
