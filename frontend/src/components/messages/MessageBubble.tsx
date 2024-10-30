import React, { memo } from 'react';
import { TMessage } from './types';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

type TMessageBubbleProps = {
  message: TMessage;
  className?: string;
  textClassName?: string;
  isOutgoing: boolean;
};

const MessageBubble: React.FC<TMessageBubbleProps> = ({ message, className, isOutgoing = false }) => {
  const formattedDate = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      className={clsx(
        `flex flex-col rounded-t-xl p-4 text-white`,
        isOutgoing
          ? 'bg-gradient-msg from-msg-start to-msg-end from-msg-bg-start to-msg-bg-end ml-auto rounded-bl-xl'
          : 'rounded-br-xl bg-blue-400',
        className,
      )}
    >
      <ReactMarkdown
        className={clsx(
          'prose-white prose-strong:text-white prose:leading-normal prose prose-h3:text-[1em] prose-h3:font-bold prose-a:text-primary-500 prose-strong:font-bold prose-img:w-[150px] prose-img:rounded prose-hr:my-4 prose-hr:border-black font-light',
        )}
      >
        {message.text}
      </ReactMarkdown>
      <time className="text-2xs self-end font-semibold opacity-50">{formattedDate}</time>
    </div>
  );
};

const MemoizedMessageBubble = memo(MessageBubble);

export { MemoizedMessageBubble as MessageBubble };
