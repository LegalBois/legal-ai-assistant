import { useState } from 'react';

import messageIcon from '@/assets/message.svg';
import barcodeIcon from '@/assets/barcode.svg';
import { useChatView } from '@/views/useViews.tsx';
import { getLLMAudio, TAPIError } from '@/services/API.service.ts';

import { VoicePlayer, VoiceRecorder } from '@/components/voice';
import { AppVersion, AvatarCard, RoundedButton, TGradientAnimationState, useErrorToast } from '@/components/ui';
import { Topbar } from '@/components/Topbar/Topbar';
import { useClient, useConversationId, useUserId } from '@/hooks';

const getVoiceTranscriptionRequestBody = (blob: Blob, fileName?: string) => {
  const formData = new FormData();
  const now = new Date().toISOString();
  formData.append('file', blob, fileName ?? `${now}-record.m4a`);
  return formData;
};

export const VoiceView = () => {
  const showErrorToast = useErrorToast();
  const goToChatView = useChatView();
  const [audioUrl, setAudioUrl] = useState('');
  const [avatarAnimation, setAvatarAnimation] = useState<TGradientAnimationState>('static');
  const { clientId } = useClient();
  const { conversationId } = useConversationId();
  const { userId } = useUserId();
  const [recordStopTime, setRecordStopTime] = useState<Date | null>(null);

  const fetchTTSResponse = async (blob: Blob) => {
    const requestBody = getVoiceTranscriptionRequestBody(blob);
    const textToSpeechAudioResponse = await getLLMAudio(requestBody, clientId, conversationId, userId);

    const reader = textToSpeechAudioResponse.body.getReader();
    const audioChunks: BlobPart[] = [];

    const streamAudio = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        audioChunks.push(value);
      }
    };

    await streamAudio();
    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    setAudioUrl(URL.createObjectURL(audioBlob));
  };

  const getTTSResponse = async (blob: Blob) => {
    try {
      await fetchTTSResponse(blob);
    } catch (e: any) {
      console.error('Error fetching TTS response', e);
      const errorContent = (await e.json()) as TAPIError;
      showErrorToast('There was an error while getting a TTS response: ' + errorContent.detail);
    }
  };

  const onRecordStop = async (blob: Blob, onClear: () => void) => {
    try {
      setRecordStopTime(new Date());
      await getTTSResponse(blob);
    } catch (error: unknown) {
      console.log('There was an error while getting a transcription or text to speech audio:', error);
      showErrorToast('There was an error while getting a transcription or text to speech audio');
    } finally {
      onClear();
    }
  };

  const handleAudioPlay = () => {
    if (recordStopTime) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - recordStopTime.getTime()) / 1000); // Calculate the difference in seconds

      console.log(`Audio play triggered after record stop, seconds:`, diffInSeconds);
      setRecordStopTime(null);
    }

    setAvatarAnimation('intensive');
  };

  const handleAudioEnd = () => {
    setAvatarAnimation('static');
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar className="h-15" />
      <div className="relative flex grow items-end justify-center">
        <div className=" mt-16 flex h-full flex-col justify-end px-2.5 pt-2.5">
          <AvatarCard animation={avatarAnimation}>
            <VoicePlayer audioUrl={audioUrl} onPlay={handleAudioPlay} onEnded={handleAudioEnd} />
          </AvatarCard>
        </div>
      </div>
      <div>
        <div className="flex justify-center gap-6 pt-6">
          <VoiceRecorder
            leftAction={
              <RoundedButton className="p-0" aria-label="Go to Chat View" variant="ghost" icon={messageIcon} onClick={goToChatView} />
            }
            rightAction={
              <RoundedButton
                className="p-0"
                aria-label="Go to Document scanner"
                variant="ghost"
                icon={barcodeIcon}
              />
            }
            onRecordStop={onRecordStop}
          />
        </div>
        <AppVersion />
      </div>
    </div>
  );
};
