
export type TMessage = {
  text: string;
  createdAt: number;
  isOutgoing: boolean;
  author?: string;
  context_id?: string;
};

export type TServerMessage = {
  SessionId: string;
  type: 'human' | 'AIMessageChunk';
  content: string;
  time: string;
};
