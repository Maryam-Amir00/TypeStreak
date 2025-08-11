import { createFileRoute } from '@tanstack/react-router'
import TypingBox from '../components/TypingBox.js'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      <TypingBox />
    </main>
  )
}