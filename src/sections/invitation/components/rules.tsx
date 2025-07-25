import useCustomAccount from "@/hooks/use-account";
import clsx from "clsx";
import Link from "next/link";

const Rules = (props: any) => {
  const { account } = useCustomAccount();

  return (
    <div className="w-[675px] shrink-0 rounded-2xl border border-black [background:linear-gradient(180deg,_#899BCF_-3.4%,_#545F7D_100%)] shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.25)] text-white font-Unbounded text-[15px] font-light leading-[150%] p-2">
      <div className="w-full p-[8px_36px] rounded-xl border border-black bg-black shadow-[inset_0px_2px_0px_0px_rgba(255,255,255,0.25)]">
        {
          account ? (
            <>
              <div className="text-[20px] font-[500]">
                Don’t have an access code? You can:
              </div>
              <ul className="mt-[8px] list-disc pl-[20px]">
                <li className="">
                  Pickup clues in the <Link className="text-[#78FEFF] underline underline-offset-2" prefetch href="/terminal?from=invitation">Terminal</Link>
                </li>
                <li className="">
                  Pickup clues from NADSA official <Link className="text-[#78FEFF] underline underline-offset-2" href="https://x.com/0xNADSA" target="_blank">X</Link>
                </li>
                <li className="">
                  Get a code from all Monad ecosystem projects
                </li>
              </ul>
            </>
          ) : (
            <AdmissionTicket />
          )
        }
      </div>
    </div>
  );
};

export default Rules;

export const AdmissionTicket = (props: any) => {
  const { className, isBr = true } = props;

  return (
    <div className={clsx("text-center pt-[20px] pb-[24px]", className)}>
      Access NADSA One by verifying your <Link className="text-[#78FEFF] underline underline-offset-2" href={`https://monad-testnet.socialscan.io/address/${process.env.NEXT_PUBLIC_CHART_NFT || "0x2d298c1f3a52af45ab3d34637aa293cf8a988c71"}`} target="_blank">Admission Ticket</Link> or{isBr && <br />} entering your Access Code.
    </div>
  );
};
