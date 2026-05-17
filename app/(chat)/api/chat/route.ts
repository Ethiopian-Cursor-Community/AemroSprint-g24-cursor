import { geolocation, ipAddress } from "@vercel/functions";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";
import { checkBotId } from "botid/server";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import { streamCursorChat } from "@/lib/ai/cursor-agent";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { allowedModelIds, DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";
import { checkIpRateLimit } from "@/lib/ratelimit";
import type { ChatMessage } from "@/lib/types";
import {
  convertToUIMessages,
  generateUUID,
  getTextFromMessage,
} from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch (_) {
    return null;
  }
}

export { getStreamContext };

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
      studyContext,
    } = requestBody;

    const [, session] = await Promise.all([
      checkBotId().catch(() => null),
      auth(),
    ]);

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const chatModel = allowedModelIds.has(selectedChatModel)
      ? selectedChatModel
      : DEFAULT_CHAT_MODEL;

    await checkIpRateLimit(ipAddress(request));

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 1,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerHour) {
      return new ChatbotError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      messagesFromDb = await getMessagesByChatId({ id });
    } else if (message?.role === "user") {
      await saveChat({
        id,
        userId: session.user.id,
        title: "New chat",
        visibility: selectedVisibilityType,
      });
      titlePromise = generateTitleFromUserMessage({ message });
    }

    const uiMessages: ChatMessage[] = [
      ...convertToUIMessages(messagesFromDb),
      message as ChatMessage,
    ];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
    }

    const system = systemPrompt({
      requestHints,
      supportsTools: false,
      studyContext,
    });

    const history = uiMessages
      .slice(0, -1)
      .map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: getTextFromMessage(m),
      }))
      .filter((m) => m.content.trim().length > 0);

    const userMessageText = message ? getTextFromMessage(message) : "";

    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer: dataStream }) => {
        const assistantMessageId = generateUUID();
        const textPartId = generateUUID();

        dataStream.write({ type: "start" });
        dataStream.write({
          type: "start-step",
        });
        dataStream.write({
          type: "text-start",
          id: textPartId,
        });

        let fullText = "";

        try {
          for await (const chunk of streamCursorChat({
            system,
            history,
            userMessage: userMessageText,
            modelId: chatModel,
            signal: request.signal,
          })) {
            if (chunk.type === "text-delta") {
              fullText += chunk.delta;
              dataStream.write({
                type: "text-delta",
                id: textPartId,
                delta: chunk.delta,
              });
            }
          }
        } finally {
          dataStream.write({
            type: "text-end",
            id: textPartId,
          });
          dataStream.write({ type: "finish-step" });
          dataStream.write({ type: "finish" });
        }

        if (titlePromise) {
          try {
            const title = await titlePromise;
            dataStream.write({ type: "data-chat-title", data: title });
            await updateChatTitleById({ chatId: id, title });
          } catch (titleError) {
            console.error("Title generation failed:", titleError);
          }
        }

        if (fullText.trim().length > 0) {
          await saveMessages({
            messages: [
              {
                id: assistantMessageId,
                role: "assistant",
                parts: [{ type: "text", text: fullText }],
                createdAt: new Date(),
                attachments: [],
                chatId: id,
              },
            ],
          });
        }
      },
      generateId: generateUUID,
      onError: (_error) => {
        return "Oops, an error occurred!";
      },
    });

    return createUIMessageStreamResponse({
      stream,
      async consumeSseStream({ stream: sseStream }) {
        if (!process.env.REDIS_URL) {
          return;
        }
        try {
          const streamContext = getStreamContext();
          if (streamContext) {
            const streamId = generateId();
            await createStreamId({ streamId, chatId: id });
            await streamContext.createNewResumableStream(
              streamId,
              () => sseStream
            );
          }
        } catch (_) {
          /* non-critical */
        }
      },
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatbotError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatbotError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
