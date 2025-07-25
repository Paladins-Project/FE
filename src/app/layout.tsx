import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/provider";
import { ToasterProvider } from "@/components/ToasterProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DailyMates - Interactive Learning Platform",
  description:
    "A comprehensive educational platform for children, parents, teachers, and administrators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <ToasterProvider />
      </body>
    </html>
  );
}
