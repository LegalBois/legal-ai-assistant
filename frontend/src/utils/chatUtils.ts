import { TMessage, TServerMessage } from '@/components/messages/types.ts';

const parseContentFromResponse = (markdownString: string) => {
  let text;
  try {
    const json = JSON.parse(markdownString);
    text = json.response;
  } catch (e) {
    text = markdownString;
  }

  return { text };
};

export const processServerMessages = (serverMessages: TServerMessage[]): TMessage[] => {
  if (!serverMessages.length) {
    return [];
  }
  return serverMessages.map(({ content, type, time }) => {
    const isOutgoing = type === 'human';
    const offset = isOutgoing ? 0 : 1; // to have correct differencing for React key value
    const { text } = parseContentFromResponse(content);

    return {
      text,
      createdAt: new Date(time).getTime() + offset,
      isOutgoing,
    };
  });
};

export const parseNewMessageFromResponse = (botResponseMarkdownString: string): TMessage => {
  const { text } = parseContentFromResponse(botResponseMarkdownString);

  return {
    text,
    createdAt: new Date().getTime(),
    isOutgoing: false,
    author: 'Bot',
  };
};

export const prepareUserMessage = (text: string, context_id?: string): TMessage => {
  return {
    text,
    createdAt: new Date().getTime(),
    isOutgoing: true,
    author: '',
    context_id,
  };
};
