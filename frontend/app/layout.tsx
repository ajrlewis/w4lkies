import type { Metadata } from "next";
import "./globals.css";

const themeInitScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem("theme");
    var systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var shouldUseDarkMode = savedTheme === "dark" || (savedTheme === null && systemPrefersDark);
    if (shouldUseDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {
    document.documentElement.classList.remove("dark");
  }
})();
`;

export const metadata: Metadata = {
  title: "W4lkies",
  description: "W4lkies frontend migrated to Next.js"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
