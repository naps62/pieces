import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { ErrorComponentProps } from '@tanstack/react-router';

declare function RootDocument({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
interface AuthGuardProps {
    user: {
        userId: number;
        username: string;
    } | null;
    loginPath?: string;
    children: ReactNode;
}
declare function AuthGuard({ user, loginPath, children, }: AuthGuardProps): react_jsx_runtime.JSX.Element;
declare function RootErrorComponent({ error, reset }: ErrorComponentProps): react_jsx_runtime.JSX.Element;

export { AuthGuard, type AuthGuardProps, RootDocument, RootErrorComponent };
