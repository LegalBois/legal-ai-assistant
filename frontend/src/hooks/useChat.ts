import { useCallback, useEffect, useRef, useState } from 'react';
import { RemoteRunnable } from '@langchain/core/runnables/remote';
import { TMessage } from '@/components/messages/types';
// @ts-ignore
import { RunLog } from '@langchain/core/dist/tracers/log_stream';
import { useClient, useConversationId, useUserId } from '@/hooks';
import { generateId } from '@/utils';
import { getMessagesByConversationId } from '@/services/API.service.ts';
import { parseNewMessageFromResponse, processServerMessages } from '@/utils/chatUtils.ts';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const API_HOST = import.meta.env.VITE_API_HOST ?? '';

export const useChat = (onAddMessage?: () => void, onHistoryLoad?: () => void) => {
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messagesInitiallyLoaded, setMessagesInitiallyLoaded] = useState(false);
  const { conversationId, updateConversationId, isConversationIdExpired } = useConversationId();
  const { userId, setUserId } = useUserId();
  const [messages, setMessages] = useState<TMessage[]>([]);

  const onNewClientInit = () => {
    updateConversationId();
    setUserId(generateId());
  };
  const onSameClientInit = () => {
    if (isConversationIdExpired()) {
      updateConversationId();
    } else {
      loadMessages();
    }
  };
  const { clientId, resetClientId } = useClient(onNewClientInit, onSameClientInit);
  const prevMessagesLength = useRef(messages.length);

  const loadMessages = async () => {
    try {
      const newMessages = await getMessagesByConversationId(conversationId, clientId);
      setMessagesInitiallyLoaded(true);
      setMessages(processServerMessages(newMessages));
      if (onHistoryLoad) {
        onHistoryLoad();
      }
    } catch (error) {
      console.error('Message history loading failed', error);
    }
  };

  useEffect(() => {
    if (messages.length !== prevMessagesLength.current && !messagesInitiallyLoaded) {
      if (onAddMessage) {
        onAddMessage();
      }
      prevMessagesLength.current = messages.length;
    }
  }, [messages]);

  const sendResponseTimeToGTM = (time: number) => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'responseTime',
        responseTime: time,
      });
    }
  };

  const sendMessage = useCallback(
    async (message: TMessage): Promise<TMessage> => {
      // Create a new RemoteRunnable with updated headers
      const remoteChain = new RemoteRunnable({
        url: `${API_HOST}/api/${clientId}`,
        options: {
          headers: {
            user_id: userId,
            conversation_id: conversationId,
            context_id: message.context_id,
          },
        },
      });

      setMessages(prevMessages => [...prevMessages, message]);

      const startTime = Date.now();

      const logStream = await remoteChain.stream(
        { human_input: message.text },
        {
          // Additional options if needed
        },
      );

      let currentState: RunLog;

      try {
        let isBotMessageAdded = false;

        for await (const chunk of logStream) {
          if (!currentState) {
            currentState = chunk;
          } else {
            currentState = currentState.concat(chunk);
            if (!isBotMessageAdded) {
              setIsBotTyping(true);
              isBotMessageAdded = true;
            }
          }
        }

        const newBotMessage: TMessage = parseNewMessageFromResponse(currentState);
        setMessages(prevMessages => [...prevMessages, newBotMessage]);

        const endTime = Date.now();

        const responseTime = endTime - startTime;
        sendResponseTimeToGTM(responseTime);

        return newBotMessage;
      } catch (error) {
        console.error('Error in streaming response:', error);
        throw error;
      } finally {
        setIsBotTyping(false);
      }
    },
    [userId, conversationId, messages],
  );

  const onChatReset = () => {
    resetClientId();
    onNewClientInit();
    window.location.reload();
  };

  return { isBotTyping, sendMessage, messages, onChatReset, messagesInitiallyLoaded };
};
