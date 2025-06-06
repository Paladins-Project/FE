import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduKids - Interactive Learning Platform",
  description:
    "A comprehensive educational platform for children, parents, teachers, and administrators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
