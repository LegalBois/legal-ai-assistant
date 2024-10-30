import React, { useEffect, useState } from 'react';
import { TMessage } from './types';
import arrowIcon from '@/assets/arrow.svg';
import microphoneIcon from '@/assets/microphone.svg';
import clsx from 'clsx';
import { useVoiceView } from '@/views/useViews.tsx';
import { prepareUserMessage } from '@/utils/chatUtils.ts';

interface Props {
  onSendMessage: (message: TMessage) => void;
  onChatReset: () => void;
}

export const MessageSend: React.FC<Props> = ({ onSendMessage, onChatReset: onChatReset }) => {
  const [message, setMessage] = useState('');
  const goToVoiceView = useVoiceView();
  const msgRef = React.createRef<HTMLTextAreaElement>();

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.focus();
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message) return;

    if (message === 'Clear4me1!2@3#') {
      onChatReset();
      return;
    }

    onSendMessage(prepareUserMessage(message));
    setMessage('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSubmit(event as never);
      event.preventDefault();
    } else if (event.key === 'Enter' && event.shiftKey) {
      setMessage(message + '\n');
      event.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shadow-blue-shadow-top relative z-10 m-0 w-full border-t border-blue-300 bg-blue-900 p-2 pb-0">
      <div className="grid-cols-1fr-auto relative grid items-center overflow-hidden">
        <div className="relative">
          <pre className="max-h-msg break-word-legacy invisible box-border whitespace-pre-wrap border border-transparent px-3 py-2.5 font-sans font-light">
            {message}
            <br />
          </pre>
          <textarea
            ref={msgRef}
            className="max-h-msg break-word-legacy absolute left-0 top-0 block h-full w-full resize-none whitespace-pre-wrap rounded-2xl bg-blue-800 px-3 py-2.5 text-base font-light text-white placeholder-white/70 outline-none"
            name="message"
            id="message"
            value={message}
            onKeyDown={handleKeyDown}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask me..."
            required
          />
        </div>
        <button
          aria-label="Record voice message"
          className={clsx('cursor-pointer', {
            'sr-only': message,
          })}
          onClick={goToVoiceView}
        >
          <img src={microphoneIcon} alt="Send" className="aspect-square" width="56" height="56" />
        </button>
        <button
          type="submit"
          aria-label="Send message"
          className={clsx(
            'border-primary-500 bg-primary-500 focus:bg-primary-600 active:bg-primary-200 my-1.5 ml-3 grid h-11 w-11 items-center justify-center rounded-full border outline-none',
            {
              'sr-only': !message,
            },
          )}
        >
          <img src={arrowIcon} alt="Send" className="aspect-square" width="17" height="19" />
        </button>
      </div>
    </form>
  );
};
