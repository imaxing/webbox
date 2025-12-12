import "./globals.css";
import { Providers } from "@/components";

export const metadata = {
  title: "Webbox Admin",
  description: "Webbox 管理后台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
