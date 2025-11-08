import type { Metadata } from "next";
import "./globals.css";
import RxDBProvider from "../providers/RxDBProvider";

export const metadata: Metadata = {
  title: "eClinic - Healthcare Management System",
  description: "Modern healthcare management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <RxDBProvider>
          {children}
        </RxDBProvider>
      </body>
    </html>
  );
}

