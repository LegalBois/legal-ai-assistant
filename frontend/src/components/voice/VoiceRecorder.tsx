import { StatusMessages, useReactMediaRecorder } from 'react-media-recorder';
import clsx from 'clsx';
import { FC, ReactNode } from 'react';
import { RoundedButton } from '@/components/ui/RoundedButton.tsx';
import microphoneIcon from '@/assets/microphone.svg';
import binIcon from '@/assets/bin.svg';
import arrowIcon from '@/assets/arrow-big.svg';

type TVoiceRecorderProps = {
  leftAction: ReactNode;
  rightAction: ReactNode;
  className?: string;
  onRecordStop: (blob: Blob, onClear: () => void) => void;
};

const isStatusEquivalent = (currentStatus: StatusMessages, compareStatus: StatusMessages): boolean => currentStatus === compareStatus;

const isRecordingStatus = (status: StatusMessages): boolean => isStatusEquivalent(status, 'recording');

export const VoiceRecorder: FC<TVoiceRecorderProps> = ({ leftAction, rightAction, className, onRecordStop }) => {
  const onRecordStopHandler = (_blobUrl: string, blob: Blob) => {
    onRecordStop(blob, onClear);
  };
  const { status, startRecording, stopRecording, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: onRecordStopHandler,
  });

  const onRecorderClick = () => {
    if (status === 'idle') {
      startRecording();
    } else if (isRecordingStatus(status)) {
      stopRecording();
    }
  };

  const onClear = () => {
    clearBlobUrl();
  };

  return (
    <div className={clsx('grid grid-cols-[1fr_auto_1fr] gap-3', className)}>
      <div className="flex justify-end">
        {isRecordingStatus(status) ? (
          <RoundedButton className="p-0" aria-label="Clear Recorded audio" variant="ghost" icon={binIcon} onClick={onClear} />
        ) : (
          <>{leftAction}</>
        )}
      </div>
      <div className="px-4 py-3">
        <RoundedButton
          className={clsx('px-6 py-0', {
            'bg-primary-200 border-primary-200': isRecordingStatus(status),
          })}
          aria-label="Start Recording"
          icon={isRecordingStatus(status) ? arrowIcon : microphoneIcon}
          isPulsing={isRecordingStatus(status)}
          onClick={onRecorderClick}
        />
      </div>
      <div className="flex justify-start">{isRecordingStatus(status) ? null : <>{rightAction}</>}</div>
    </div>
  );
};
