import React, { memo, useEffect, useRef } from 'react';
import { TMessage } from './types';
import { MessageBubble } from '@/components';
import clsx from 'clsx';

interface Props {
  messages: TMessage[];
  className?: string;
  elementRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
}

const MessageList: React.FC<Props> = ({ messages, className, elementRef, isTyping = false }) => {
  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = () => {
    elementRef.current?.scrollTo({
      top: elementRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  return (
    <div ref={elementRef} className="relative h-full max-h-full flex-col-reverse overflow-y-scroll bg-blue-900">
      <div
        className={clsx('w-welcome-text absolute left-8 mx-auto mt-48 flex flex-col justify-end', {
          hidden: messages.length > 0,
        })}
      >
        <p className="text-welcome text-greeting font-semibold text-white">Welcome to Your Legal AI Assistant!</p>
        <p className="text-primary-100 font-light">What are you need help to?</p>
      </div>
      <ul className={clsx('z-10 flex min-h-full w-full flex-col justify-end gap-6 px-2.5 pb-3 pt-3', className)}>
        {messages.map(msg => (
          <li className={clsx('break-word-legacy')} key={msg.createdAt}>
            <MessageBubble
              className={clsx('sm:w-msg w-[90%]', msg.isOutgoing ? 'ml-auto' : 'mr-auto')}
              isOutgoing={msg.isOutgoing}
              message={msg}
            />
          </li>
        ))}
        <li
          className={clsx({
            hidden: !isTyping,
          })}
        >
          <div className="bg-primary-100 ml-3 flex max-w-[50px] items-center justify-center gap-1 rounded-xl px-3.5 py-3.5">
            <div className="bg-primary-500 motion-safe:animate-bounce-slow h-2 w-2 rounded-full"></div>
            <div className="bg-primary-500 motion-safe:animate-bounce-slow motion-safe:animate-delay-300 h-2 w-2 rounded-full"></div>
            <div className="bg-primary-500 motion-safe:animate-bounce-slow motion-safe:animate-delay-500 h-2 w-2 rounded-full"></div>
          </div>
        </li>
      </ul>
    </div>
  );
};

const MemoizedMessageList = memo(MessageList);

export { MemoizedMessageList as MessageList };
