import { useCallback, useEffect, useRef, useState } from 'react';
import { RemoteRunnable } from '@langchain/core/runnables/remote';
import { TMessage } from '@/components/messages/types';
import { RunLog } from '@langchain/core/dist/tracers/log_stream';
import { useClient, useConversationId, useUserId } from '@/hooks';
import { generateId } from '@/utils';
import { getMessagesByConversationId } from '@/services/API.service.ts';
import { parseNewMessageFromResponse, processServerMessages } from '@/utils/chatUtils.ts';

const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:80';

export const useChat = (onAddMessage?: () => void, onHistoryLoad?: () => void) => {
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messagesInitiallyLoaded, setMessagesInitiallyLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true); // Set loading state to true
      const remoteChain = new RemoteRunnable({
        url: `${API_HOST}/${clientId}`,
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
        message.text,
        {
          // Additional options if needed
        },
      );

      let currentState: RunLog;

      try {
        let isBotMessageAdded = false;

        for await (const chunk of logStream) {
          if (!currentState) {
            currentState = chunk.content;
            setIsLoading(false);
            const newBotMessage = parseNewMessageFromResponse(currentState);
            setMessages(prevMessages => [...prevMessages, newBotMessage]);
            console.log('Initial state:', currentState);
          } else {
            currentState = currentState.concat(chunk.content);
            console.log('Another state:', currentState);
            if (!isBotMessageAdded) {
              setIsBotTyping(true);
              isBotMessageAdded = true;
            }
            const newBotMessage = parseNewMessageFromResponse(currentState);
            setMessages(prevMessages => {
              const messagesWithoutLast = prevMessages.slice(0, -1);
              return [...messagesWithoutLast, newBotMessage];
            });
          }
        }

        const newBotMessage: TMessage = parseNewMessageFromResponse(currentState);

        const endTime = Date.now();

        const responseTime = endTime - startTime;
        sendResponseTimeToGTM(responseTime);

        return newBotMessage;
      } catch (error) {
        console.error('Error in streaming response:', error);
        throw error;
      } finally {
        setIsBotTyping(false);
        setIsLoading(false);
      }
    },
    [userId, conversationId, messages],
  );

  const onChatReset = () => {
    resetClientId();
    onNewClientInit();
    window.location.reload();
  };

  return { isBotTyping, sendMessage, messages, onChatReset, messagesInitiallyLoaded, isLoading };
};