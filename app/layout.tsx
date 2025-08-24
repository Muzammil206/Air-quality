
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata = {
  title: " Air Quality  ",
  description: " Air Quality Monitoring Dashboard",
  keywords: ["Air Quality", "Abuja ", "Nigeria", "narda"],
  authors: [{ name: "ismail muzammil" }],
  creator: "Ismail muzammil",
  publisher: "ismail muzammil",
  themeColor: "#4ade80",
  
  icons: {
    icon: "/favicon.ico",
    pyramid: "/favicon.ico",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={''}
      >
        {children}
      </body>
    </html>
  );
}
