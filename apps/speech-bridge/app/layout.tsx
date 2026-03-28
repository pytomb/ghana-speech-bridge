import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ghana Speech Bridge",
  description: "Voice + language infrastructure for Ghanaian applications",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "monospace", padding: "2rem", background: "#0a0a0a", color: "#e5e5e5" }}>
        {children}
      </body>
    </html>
  );
}
