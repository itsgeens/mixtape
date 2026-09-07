export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'reviewing' | 'playing';

export interface Recording {
  id: string;
  eventId: string;
  audioUrl: string;
  photoUrl?: string;
  promptUsed?: string;
  guestName?: string;
  duration: number; // in seconds
  createdAt: string;
  blob?: Blob;
}

export interface Prompt {
  id: string;
  eventId: string;
  promptText: string;
  createdAt?: string;
}

export interface EventConfig {
  id: string;
  slug: string;
  coupleNames: string;
  eventDate: string;
  createdAt?: string;
}

export interface AudioVisualizerData {
  leftLevel: number;  // 0 to 100
  rightLevel: number; // 0 to 100
  peakLevel: number;  // 0 to 100
}
