import type { Metadata } from "next";
import { SidebarNavigationController } from "@/components/shared/SidebarNavigationController";
import "./globals.css";
import Provider from "@/Providers/Provider";
import MainProviders from "@/Providers/MainProviders";

export const metadata: Metadata = {
  title: "OBS Service Dashboard",
  description: "Online service management dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <MainProviders>
            <SidebarNavigationController />
            {children}
          </MainProviders>
        </Provider>
      </body>
    </html>
  );
}
