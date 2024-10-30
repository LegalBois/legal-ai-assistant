export type TVoiceTranscriptionRequestBody = {
  file: Blob;
};

export type TVoiceTranscription = {
  transcription: string;
};

export type TVoiceAudioRequestBody = {
  text: string;
  voice?: string;
};
