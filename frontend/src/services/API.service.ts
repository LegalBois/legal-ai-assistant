import { TServerMessage } from '@/components/messages/types';
import { TVoiceAudioRequestBody, TVoiceTranscription, TVoiceTranscriptionRequestBody } from '@/components/voice/types';

const API_HOST = import.meta.env.VITE_API_HOST ?? '';

export type TAPIError = {
  detail: {
    loc: string[];
    msg: string;
    type: string;
  }[];
};

export const getMessagesByConversationId = async (conversationId: string, clientId: string): Promise<TServerMessage[]> => {
  const response = await fetch(`${API_HOST}/api/chats/by_conversation_id/?conversation_id=${conversationId}&client_db=${clientId}`);
  return response.json();
};

export const getVoiceTranscription = async (requestBody: TVoiceTranscriptionRequestBody): Promise<TVoiceTranscription> => {
  const response = await fetch(`${API_HOST}/api/voice/transcribe`, {
    method: 'POST',
    body: requestBody as unknown as FormData,
  });
  return response.json();
};

export const getTextToSpeechAudio = async (requestBody: TVoiceAudioRequestBody): Promise<any> => {
  return await fetch(`${API_HOST}/api/voice/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
};

export const getLLMAudio = async (
  requestBody: FormData,
  clientId: string,
  conversationId: string,
  userId: string,
  voice = 'nova',
): Promise<any> => {
  return await fetch(
    `${API_HOST}/api/voice/llm?client_name=${clientId}&conversation_id=${conversationId}&user_id=${userId}&voice=${voice}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: requestBody,
    },
  );
};
