import { motion } from "framer-motion";
import Keyboards from "./components/keyboards";
import { AdmissionTicket } from "./components/rules";
import ConnectButton from "./components/connect-button";
import { useInvitationContext } from "@/context/invitation";

const InvitationViewMobile = () => {
  const {
    finalValid,
  } = useInvitationContext();

  if (finalValid) {
    return null;
  }

  return (
    <div className="w-screen h-screen bg-black bg-[url('/images/mobile/bg-boat-window.png')] bg-no-repeat bg-top bg-[auto_300px] overflow-y-auto pb-[20dvh]">
      <img src="/images/logo-green.svg" alt="" className="w-[134px] h-[55px] object-contain mx-auto mt-[45px]" />
      <motion.img
        src="/images/invitation/bg-ticket-straight.png"
        alt=""
        className="w-[231px] h-[143px] object-contain mx-auto mt-[38px]"
        initial={{
          scale: 0.1,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          delay: 0.3,
        }}
      />
      <AdmissionTicket className="!pt-[36px] !text-white !text-[13px] !pb-[unset]" isBr={false} />
      <div className="px-[20px] w-full mt-[36px]">
        <ConnectButton className="!bg-[#78FEFF]" />
      </div>
      <div className="px-[15px] mt-[25px]">
        <div className="w-full border-t border-[rgba(166,166,219,0.5)] flex justify-center">
          <div className="w-[40px] bg-black text-[#A6A6DB] text-center font-Unbounded text-[13px] font-light leading-[150%] -translate-y-[10px]">
            or
          </div>
        </div>
      </div>
      <div className="mt-[20px] px-[20px]">
        <Keyboards className="![transform:unset] !w-full" />
      </div>
    </div>
  );
};

export default InvitationViewMobile;
