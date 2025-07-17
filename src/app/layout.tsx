"use client";

import SceneContextProvider from "@/context/scene";
import WagmiProvider from "@/context/wagmi";
import MainLayout from "@/layouts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import Script from "next/script";
import React, { Suspense, useEffect } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import InvitationContextProvider from "@/context/invitation";

dayjs.extend(utc);

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    async function loadPlugin() {
      if (typeof window !== 'undefined') {
        const VConsole = await import('vconsole');
        new VConsole.default();
      }
    }
    loadPlugin();
  }, []);

  return (
    <html lang="en" className="md:overflow-hidden">
      <head>
        <title>NADSA</title>
        <meta
          name="description"
          content="Effortlessly explore & dive into all dApps in the Monad ecosystem from one streamlined hub."
        />
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="md:overflow-hidden">
        <WagmiProvider>
          <SkeletonTheme baseColor="#7990F4" highlightColor="#8B87FF">
            <SceneContextProvider>
              <InvitationContextProvider>
                <Suspense>
                  <MainLayout>{children}</MainLayout>
                </Suspense>
              </InvitationContextProvider>
            </SceneContextProvider>
          </SkeletonTheme>
        </WagmiProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          theme="light"
          toastStyle={{ backgroundColor: "transparent", boxShadow: "none" }}
          newestOnTop
          rtl={false}
          pauseOnFocusLoss
          closeButton={false}
          limit={3}
        />
        <ProgressBar
          height="4px"
          color="#8B87FF"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </body>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-SZ82B6ZN43"
      ></Script>
      <Script id="ga-config">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SZ82B6ZN43');`}
      </Script>
    </html>
  );
}
