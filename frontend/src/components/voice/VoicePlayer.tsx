import { FC, useEffect, useRef } from 'react';

type TVoicePlayerProps = {
  audioUrl: string;
  onPlay?: () => void;
  onEnded?: () => void;
};

export const VoicePlayer: FC<TVoicePlayerProps> = ({ audioUrl = '', onPlay, onEnded }) => {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioPlayerRef.current?.paused && audioUrl) {
      try {
        audioPlayerRef.current?.play();
      } catch (error) {
        console.log('Play error', error);
      }
    }
  }, [audioUrl]);

  useEffect(() => {
    const audioElement = audioPlayerRef.current;

    if (audioElement) {
      if (onPlay) {
        audioElement.addEventListener('play', onPlay);
      }
      if (onEnded) {
        audioElement.addEventListener('ended', onEnded);
      }
    }

    return () => {
      if (audioElement) {
        if (onPlay) {
          audioElement.removeEventListener('play', onPlay);
        }
        if (onEnded) {
          audioElement.removeEventListener('ended', onEnded);
        }
      }
    };
  }, [onPlay, onEnded]);

  return (
    <>
      <audio ref={audioPlayerRef} controls hidden id="audioPlayer" src={audioUrl}></audio>
    </>
  );
};
