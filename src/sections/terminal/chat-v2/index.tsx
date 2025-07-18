"use client";

import {
  MessageQueryDirection,
  Realtime,
  TextMessage
} from "leancloud-realtime";
import LC from "leancloud-storage";
import { useEffect, useRef, useState } from "react";
import { useDebounceFn, useRequest, useInterval } from "ahooks";
import useUsersInfo from "../hooks/use-users-info";
import { useTerminalStore } from "@/stores/terminal";
import ChatCard from "@/sections/terminal/chat-v2/card";
import ChatHeader from "@/sections/terminal/chat-v2/header";
import ChatContent from "@/sections/terminal/chat-v2/content";
import ChatBg from "@/sections/terminal/chat-v2/bg";
import { FE_SYSTEM_KEY, VERSION } from "@/sections/terminal/config";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import NFT from "@/components/nft";
import { useTwitterStore } from "@/stores/twitter";
import { post } from "@/utils/http";
import "./animate.css";
import useIsMobile from "@/hooks/use-isMobile";
import ChatFooter from "./footer";
import DataOverrideMobile from "../components/data-override";
import clsx from "clsx";

const realtime = new Realtime({
  appId: process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID!,
  appKey: process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY!,
  server: process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL
});

LC.init({
  appId: process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID!,
  appKey: process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY!,
  serverURL: process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL
});

// Chat room ID
const CHAT_ROOM_ID = process.env.NEXT_PUBLIC_LEANCLOUD_ROOM_ID;

const START_TIMESTAMP = dayjs();

const SYSTEM_CHECK_MESSAGES = [
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP),
    text: `NADSA COMMUNICATION SYSTEM v${VERSION}`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(1, "seconds"),
    text: `INITIALIZING...`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(2, "seconds"),
    text: `MEMORY CHECK: OK`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(3, "seconds"),
    text: `COMMUNICATION ARRAY: ONLINE`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(4, "seconds"),
    text: `ENCRYPTION MODULES: ACTIVE`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(5, "seconds"),
    text: `SYSTEM READY`,
    from: FE_SYSTEM_KEY
  },
  {
    id: uuidv4(),
    timestamp: dayjs(START_TIMESTAMP).add(6, "seconds"),
    text: `ESTABLISHING CONNECTION...`,
    from: FE_SYSTEM_KEY
  }
];

export default function ChatView({ currentUser }: any) {
  const isMobile = useIsMobile();

  // @ts-ignore
  const [messages, setMessages] = useState<any[]>([...SYSTEM_CHECK_MESSAGES]);
  const [previousPageMessages, setPagePreviousMessages] = useState<
    TextMessage[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const conversationRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(true);
  const messagesRef = useRef<any>();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { fetchUsersInfo } = useUsersInfo();
  const terminalStore: any = useTerminalStore();
  const twitterStore: any = useTwitterStore();
  const [isPageVisible, setIsPageVisible] = useState(true);
  const loadingMessageRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const { run: scrollToBottom } = useDebounceFn(
    () => {
      if (!messagesEndRef.current) {
        return;
      }
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    },
    { wait: 300 }
  );

  const { runAsync: fetchHistoryMessages, loading: historyMessagesLoading } =
    useRequest(
      async (isFresh?: boolean) => {
        if (!conversationRef.current) {
          return;
        }

        const isPrevious = messages.length > 0 && !isFresh;

        // https://leancloud.github.io/js-realtime-sdk/docs/ChatRoom.html#queryMessages
        let options: any = {
          limit: 20,
          direction: MessageQueryDirection.NEW_TO_OLD
        };

        if (isPrevious) {
          options.limit = 20;
          options.direction = MessageQueryDirection.OLD_TO_NEW;
          if (previousPageMessages.length) {
            options.beforeMessageId = previousPageMessages[0].id;
            options.beforeTime = previousPageMessages[0].timestamp;
          } else {
            options.beforeMessageId = messages.filter(
              (m) => m.from !== FE_SYSTEM_KEY
            )[0].id;
            options.beforeTime = messages.filter(
              (m) => m.from !== FE_SYSTEM_KEY
            )[0].timestamp;
          }
        }

        loadingMessageRef.current = true;

        const historyMessages = await conversationRef.current.queryMessages(
          options
        );

        hasMoreRef.current = historyMessages.length >= 20;

        const sortedMessages = historyMessages
          .map((m: any) => {
            if (isPrevious) {
              m.localType = "prevPage";
            }
            return m;
          })
          .sort(
            (a: any, b: any) =>
              dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf()
          );

        await fetchUsersInfo(
          [
            ...sortedMessages.map((message: TextMessage) => message.from),
            currentUser.id?.toLowerCase()
          ],
          { from: "HistoryMessages" }
        );

        if (isPrevious) {
          const scrollHeightBefore = messagesRef.current?.scrollHeight;
          const scrollTopBefore = messagesRef.current?.scrollTop;
          setPagePreviousMessages((prevMessages) => {
            return [...prevMessages, ...sortedMessages] as TextMessage[];
          });
          const _timer = setTimeout(() => {
            clearTimeout(_timer);
            const scrollHeightAfter = messagesRef.current.scrollHeight;
            const heightDifference = scrollHeightAfter - scrollHeightBefore;
            messagesRef.current.scrollTop = scrollTopBefore + heightDifference;
          }, 0);
        } else {
          setMessages((prevMessages) => {
            const nextMessages = [
              ...prevMessages,
              ...sortedMessages
            ] as TextMessage[];

            return [
              ...nextMessages.slice(0, SYSTEM_CHECK_MESSAGES.length),
              ...nextMessages
                .slice(SYSTEM_CHECK_MESSAGES.length - 1)
                .sort(
                  (a: any, b: any) =>
                    dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf()
                )
            ];
          });
        }
        loadingMessageRef.current = false;
      },
      { manual: true }
    );

  const { run: fetchHistoryMessagesDebounced } = useDebounceFn(
    (e: any) => {
      const element = e.target as HTMLDivElement;
      if (element.scrollTop < 30 && hasMoreRef.current) {
        fetchHistoryMessages(false);
      }
    },
    {
      wait: 500
    }
  );

  useEffect(() => {
    if (!currentUser.id) {
      return;
    }

    let client: any;
    realtime
      .createIMClient(String(currentUser.id))
      .then(async (_client: any) => {
        client = _client;
        console.log("IM client created successfully");

        // Report id to backend
        post("/chat/member", { account: currentUser.id });

        try {
          if (!CHAT_ROOM_ID) {
            throw Error("room not esit");
          }
          // Try to get the terminal room
          const existingConversation = await _client.getConversation(
            CHAT_ROOM_ID
          );
          console.log(
            "Chat room retrieved successfully:",
            existingConversation
          );
          if (!existingConversation) {
            throw new Error("Chat room not found");
          }
          return existingConversation;
        } catch (error) {
          console.error("Failed to get terminal room:", error);

          // Create a new terminal room if it doesn't exist
          console.log("Attempting to create a new terminal room");
          try {
            const newChatRoom = await _client.createChatRoom({
              name: "One Won Chat"
            });
            console.log(
              "New terminal room created successfully:",
              newChatRoom.id
            );
            return newChatRoom;
          } catch (createError) {
            console.error("Failed to create terminal room:", createError);
            throw createError;
          }
        }
      })
      .then(async (chatroom: any) => {
        conversationRef.current = chatroom;
        console.log("conversationRef.current", conversationRef.current);
        console.log("Chat room connected successfully:", chatroom.id);

        try {
          // Join the terminal room
          await chatroom.join();
          console.log("Successfully joined the terminal room");
          setIsConnected(true);

          await fetchHistoryMessages(true);
          scrollToBottom();
          // Listen for new messages
          chatroom.on("message", async (message: TextMessage) => {
            console.log("New message received:", message);
            await fetchUsersInfo([message.from], {
              from: "New message received"
            });
            // @ts-ignore
            message.isSlient =
              document.hidden || !isElementInViewport(messagesEndRef.current);

            setMessages((prev) => [...prev, message]);
          });

          chatroom.count().then((res: any) => {
            setOnlineUsers(res);
          });

          return chatroom;
        } catch (error) {
          console.error("Failed to join terminal room:", error);

          throw error;
        }
      })
      .catch((error: any) => {
        console.error("Chat room setup error:", error);
      });

    return () => {
      if (client) {
        client.close();
      }
    };
  }, [currentUser]);

  const { runAsync: sendMessage, loading: sending } = useRequest(
    async () => {
      if (
        !conversationRef.current ||
        !inputMessage.trim() ||
        !isConnected ||
        !currentUser.id
      ) {
        return;
      }

      try {
        console.log("Preparing to send message...");
        const message = new TextMessage(inputMessage);
        console.log("Message object created successfully:", message);

        // @ts-ignore
        setMessages((prev) => [...prev, message]);

        await fetchUsersInfo([message.from || currentUser.id?.toLowerCase()], {
          from: "send message"
        });
        scrollToBottom();
        await conversationRef.current.send(message);
        console.log("Message sent successfully");
        terminalStore.set({
          remainSeconds: 5,
          postTime: Date.now()
        });
        setInputMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    { manual: true, throttleWait: 1000 }
  );

  const onLoginOut = () => {
    twitterStore.set({
      id: "",
      info: {}
    });
  };

  useInterval(
    () => {
      if (conversationRef.current && isConnected && isPageVisible) {
        conversationRef.current.count().then((res: any) => {
          setOnlineUsers(res);
        });
      }
    },
    isConnected && isPageVisible ? 30000 : undefined
  );

  return (
    <div className="relative md:flex md:flex-col md:items-stretch w-full h-screen overflow-x-hidden bg-[#010101] font-Pixelmix text-[#8D7CFF] text-[14px] font-[400] leading-[200%] overflow-y-auto cursor-pointer terminal">
      <ChatHeader
        currentUser={currentUser}
        onlineUsers={onlineUsers}
        onLoginOut={onLoginOut}
      />
      {!isMobile && (
        <div
          className="absolute top-[66px] left-[60px] z-[5] font-[400] leading-[90%] text-[110px] text-[#E7E2FF] font-HackerNoonV2 drop-shadow-[0_0_30px_#836EF9] not-italic"
          style={{
            textShadow: "0px 0px 30px #836EF9"
          }}
        >
          NADSA_TERMINAL
        </div>
      )}
      <div className="relative z-[10] w-[calc(100%-308px)] flex justify-center min-w-[1085px] md:flex-1 md:h-0 md:overflow-hidden md:w-full md:min-w-[unset]">
        <ChatCard className="relative z-[5] mt-[45px] md:mt-0 md:pb-[12px]">
          <ChatContent
            messagesRef={messagesRef}
            sendMessage={sendMessage}
            messages={messages}
            previousPageMessages={previousPageMessages}
            onScroll={fetchHistoryMessagesDebounced}
            messagesEndRef={messagesEndRef}
            currentUser={currentUser}
            setInputMessage={setInputMessage}
            inputMessage={inputMessage}
            scrollToBottom={scrollToBottom}
          />
          {isMobile && (
            <DataOverrideMobile
              className="absolute top-[-32px] right-[8px]"
              onLoginOut={onLoginOut}
            />
          )}
        </ChatCard>
        {!isMobile && (
          <div className="absolute z-[1] left-[30px] top-[100px] bg-[url('/images/terminal/card-star.png')] bg-cover bg-center bg-no-repeat w-[100px] h-[100px]" />
        )}
      </div>
      {isMobile && <ChatFooter className="fixed bottom-0 left-0 w-full" />}
      <ChatBg />
      {!isMobile && (
        <NFT
          isOpen={true}
          closeModal={() => {}}
          className={clsx("!items-start left-[0px] !pt-[60px]")}
          onLoginOut={onLoginOut}
        />
      )}
    </div>
  );
}

const isElementInViewport = (el: HTMLElement | null) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};
