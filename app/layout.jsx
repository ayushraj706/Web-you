import '../styles/globals.css'

export const metadata = {
  title: 'InstaHub - Instagram & WhatsApp API Dashboard',
  description: 'Professional dashboard for managing Instagram and WhatsApp API integrations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
