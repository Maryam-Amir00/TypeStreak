import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signUp')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/signUp"!</div>
}
