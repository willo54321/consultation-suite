import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Kite Homes | Public Consultation",
  description: "Have your say on our proposed development. Join the public consultation and help shape the future of this exciting new community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/jbi6bqr.css" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
