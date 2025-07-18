// Hooks
import { useEffect, useState } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";

// UI
import { toast } from "react-toastify";
import FunPurpleButton from "./FunPurpleButton";
import { publicClient } from "../utils/client";
import { formatEther, Hex } from "viem";
import { post } from "../utils/fetch";

type LoginButtonProps = {
    resetGame: () => void;
};

export default function LoginButton({ resetGame }: LoginButtonProps) {
    const { login } = useLogin();
    const { logout } = useLogout();
    const { user, authenticated } = usePrivy();

    const [loginLoading, setLoginLoading] = useState(false);
    const [faucetLoading, setFaucetLoading] = useState(false);

    const handleLogin = async () => {
        setLoginLoading(true);

        try {
            login();
            setLoginLoading(false);
        } catch (err) {
            console.log("Problem logging in: ", err);
            setLoginLoading(false);
        }
    };

    const [address, setAddress] = useState("");
    useEffect(() => {
        if (!user) {
            setAddress("");
            return;
        }

        const [privyUser] = user.linkedAccounts.filter(
            (account) =>
                account.type === "wallet" &&
                account.walletClientType === "privy"
        );
        if (!privyUser || !(privyUser as any).address) {
            setAddress("");
            return;
        }

        setAddress((privyUser as any).address);
    }, [user]);

    const handleFaucetRequest = async () => {
        if (!user) {
            toast.error("Please log-in.");
            return;
        }

        const [privyUser] = user.linkedAccounts.filter(
            (account) =>
                account.type === "wallet" &&
                account.walletClientType === "privy"
        );
        if (!privyUser || !(privyUser as any).address) {
            toast.error("Embedded wallet not found.");
            return;
        }
        const privyUserAddress = (privyUser as any).address;

        const balance = await publicClient.getBalance({
            address: privyUserAddress as Hex,
        });
        if (parseFloat(formatEther(balance)) >= 0.5) {
            // toast.info("Player has enough MON to play.");
            return;
        }

        setFaucetLoading(true);

        try {
            const response = await post({
                url: "https://2048-faucet.monad.xyz",
                params: {
                    address: privyUserAddress,
                },
            });

            const transactionHash = response.txHash;
            console.log("Funded tx: ", transactionHash);

            toast.success(`Player funded!`,
                //      {
                //     description: `Funded player with 0.5 MON from faucet.`,
                // }
            );
        } catch (e) {
            console.log((e as any).message);
            console.log("Error fetching testnet MON: ", e);
            toast.info(`You'll need MON to play this game.`,
                //      {
                //     description: `Continue playing and try the in-game faucet or fund directly.`,
                // }
            );
        }

        setFaucetLoading(false);
    };

    useEffect(() => {
        if (!user) return;
        handleFaucetRequest();
    }, [user]);

    const copyToClipboard = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
            toast.info("Copied to clipboard.");
        }
    };

    const abbreviatedAddress = address
        ? `${address.slice(0, 4)}...${address.slice(-2)}`
        : "";

    return (
        <>
            {user && authenticated ? (
                <div className="flex flex-col items-center mt-[25px]">
                    {/* <FunPurpleButton
                        text="New Game"
                        onClick={resetGame}
                        loadingText="Funding player..."
                        isLoading={faucetLoading}
                    /> */}
                    <img data-bp="1009-012" src="/images/2048/new-game.svg" className="w-[135px]  cursor-pointer" onClick={resetGame} />
                    {/* <button
                        className="underline"
                        onClick={logout}
                    >
                        Logout
                    </button>
                    <div className="flex items-center gap-2">
                        <p>
                            <span className="font-bold">Player</span>:{" "}
                            {abbreviatedAddress}
                        </p>
                        <button
                            className="h-6 w-6 p-1"
                            onClick={copyToClipboard}
                        >
                        </button>
                    </div> */}
                </div>
            ) : (
                // <FunPurpleButton
                //     text="Login"
                //     loadingText="Creating player..."
                //     isLoading={loginLoading}
                //     onClick={handleLogin}
                // />
                null
            )}
        </>
    );
}
