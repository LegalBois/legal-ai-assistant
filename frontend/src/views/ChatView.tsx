import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { TMessage } from '@/components/messages/types';
import { MessageList, MessageSend, Topbar } from '@/components';
import { useChat, useScrollPosition } from '@/hooks';
import { AppVersion } from '@/components/ui/AppVersion.tsx';
import { useQueryParams } from '@/hooks/useQueryParams.ts';
import { prepareUserMessage } from '@/utils/chatUtils.ts';

type TWidgetBodyProps = {
  className?: string;
};

const ChatView: React.FC<TWidgetBodyProps> = ({ className }) => {
  const [isUserMessageSent, setIsUserMessageSent] = useState(false);
  const [showTypingBubble, setShowTypingBubble] = useState(false);
  const { context_id } = useQueryParams();
  const hookOffset = 80;
  const { elementRef } = useScrollPosition<HTMLDivElement>(hookOffset, 10);

  const handleScrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    elementRef.current?.scrollTo({
      top: elementRef.current.scrollHeight,
      behavior,
    });
  };

  const onAddMessage = () => {
    if (!isUserMessageSent) {
      setShowTypingBubble(true);
      setIsUserMessageSent(true);
    } else {
      setIsUserMessageSent(false);
    }
  };

  const onHistoryLoad = () => {
    handleScrollToBottom('instant');
  };

  const { isBotTyping, sendMessage, messages, onChatReset, messagesInitiallyLoaded } = useChat(onAddMessage, onHistoryLoad);

  useEffect(() => {
    if (isBotTyping) {
      setShowTypingBubble(false);
    }
  }, [isBotTyping]);

  useEffect(() => {
    handleScrollToBottom('instant');
  }, []);

  useEffect(() => {
    if (showTypingBubble) {
      handleScrollToBottom();
    }
  }, [showTypingBubble]);

  useEffect(() => {
    if (messagesInitiallyLoaded && messages.length === 0 && context_id) {
      console.log('context_id', context_id);
      handleSendMessage(prepareUserMessage('', context_id));
    }
  }, [messagesInitiallyLoaded, context_id]);

  const handleSendMessage = async (newMessage: TMessage) => {
    setTimeout(() => handleScrollToBottom('instant'));
    try {
      await sendMessage(newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className={clsx('relative flex flex-col overflow-y-scroll', className)}>
      <Topbar className="h-15" />
      <img
        src="images/blob.png"
        className={clsx('top-welcome-text absolute z-10', {
          hidden: messages.length > 0,
        })}
        alt="Bubble illustration"
      />
      <div className="flex-grow overflow-y-auto">
        <MessageList messages={messages.filter(({ text }) => !!text)} elementRef={elementRef} isTyping={showTypingBubble} />
      </div>
      <div>
        <MessageSend onSendMessage={handleSendMessage} onChatReset={onChatReset} />
        <AppVersion />
      </div>
    </div>
  );
};

export { ChatView };
