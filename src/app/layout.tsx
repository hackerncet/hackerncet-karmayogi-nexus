import type { Metadata } from "next";
import "./globals.css";
import "./interface.css";
import { Preferences } from "@/components/preferences";
export const metadata: Metadata = {
  title: {
    default: "Karmayogi Nexus · From learning to demonstrated competence",
    template: "%s · Karmayogi Nexus",
  },
  description:
    "An independent SIH demonstration of evidence-driven competency intelligence for India’s Official Statistical System.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Preferences>{children}</Preferences>
      </body>
    </html>
  );
}
