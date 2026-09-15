import { Analytics } from '@vercel/analytics/react'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <>
      <HomePage />
      <Analytics />
    </>
  )
}
