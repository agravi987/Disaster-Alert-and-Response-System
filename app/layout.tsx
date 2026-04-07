import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disaster Alert & Rescue Coordination",
  description: "Minimal disaster alert management dashboard",
};

const initializeThemeScript = `
(() => {
  try {
    const saved = localStorage.getItem("theme-mode");
    const theme = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (_) {
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
        <script
          dangerouslySetInnerHTML={{ __html: initializeThemeScript }}
          suppressHydrationWarning
        />
        {children}
      </body>
    </html>
  );
}
