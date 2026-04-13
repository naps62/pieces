declare module "@naps62/ui" {
  export function getThemeInitScript(): string;
  export function ThemeProvider(props: {
    children: import("react").ReactNode;
  }): import("react").JSX.Element;
  export function useTheme(): {
    theme: string;
    setTheme: (theme: string) => void;
  };
}
