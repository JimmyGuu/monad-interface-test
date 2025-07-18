"use client";

import withSound from "@/hoc/withSound";
import useClickTracking from "@/hooks/use-click-tracking";
import useRem from "@/hooks/use-rem";
import useTokenPrice from "@/hooks/use-token-price";
import useUser from "@/hooks/use-user";
import MainLayoutFooter from "@/layouts/main/footer";
import MainLayoutHeader from "@/layouts/main/header";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import clsx from "clsx";
import { useInvitationContext } from "@/context/invitation";

const MainLayout = (props: Props) => {
  const { children, style } = props;
  useRem();

  const { handleTrack } = useClickTracking();
  const { initializePrice } = useTokenPrice();
  const { handleReportNoCode } = useClickTracking();
  const { validUser } = useInvitationContext();

  useEffect(() => {
    handleReportNoCode();
    initializePrice();
  }, []);

  const { address } = useAccount();
  const { getAccessToken } = useUser();

  useEffect(() => {
    getAccessToken();
  }, [address]);

  return (
    <div
      id="layout"
      className={clsx(
        "min-h-screen relative flex flex-col items-stretch justify-start transition-background duration-150 bg-[#0E0F29]"
      )}
      onClick={handleTrack}
      style={{
        ...style
      }}
    >
      {
        validUser && (
          <MainLayoutHeader />
        )
      }
      <div className="relative grow">{children}</div>
      {
        validUser && (
          <MainLayoutFooter />
        )
      }
    </div>
  );
};

export default withSound(MainLayout);

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
