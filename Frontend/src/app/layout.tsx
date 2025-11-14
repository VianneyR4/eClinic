import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerProvider from "../components/ServiceWorkerProvider";

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
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}

