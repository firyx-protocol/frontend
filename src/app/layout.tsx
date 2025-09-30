import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import { Provider } from "./provider";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Firyx | Decentralized Non Collateral Lending Protocol",
  description: "Decentralized non-collateral lending and borrowing platform on Aptos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${nunito.className}`}>
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}
