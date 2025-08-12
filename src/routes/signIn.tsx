import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/signIn')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">Login</h2>
      <p className="mt-4">
        Don’t have an account?{" "}
        <Link to="/signUp" className="text-blue-500 underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
