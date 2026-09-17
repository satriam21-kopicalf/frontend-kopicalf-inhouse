import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kopi Calf Internal — Dashboard",
  description: "Inventory & Cost Control Dashboard Kopi Calf",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#0D2B5E',
              borderRadius: 8,
              fontFamily: 'var(--font-geist-sans), Helvetica, Arial, sans-serif',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
