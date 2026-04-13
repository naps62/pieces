import type { ReactNode } from "react";
import {
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { getThemeInitScript } from "./ui/index";

export function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitScript(),
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export interface AuthGuardProps {
  user: { userId: number; username: string } | null;
  loginPath?: string;
  children: ReactNode;
}

export function AuthGuard({
  user,
  loginPath = "/login",
  children,
}: AuthGuardProps) {
  const { location } = useRouterState();
  const isLoginPage = location.pathname === loginPath;

  if (!user && !isLoginPage) {
    return <Navigate to={loginPath} />;
  }

  if (!user) {
    return <Outlet />;
  }

  return <>{children}</>;
}

export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
