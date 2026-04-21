export type Participant = {
  id: string;
  name: string;
  affiliation?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
};

export type DisplayCandidate = {
  id: string;
  name: string;
  affiliation?: string;
  publicLabel: string;
};

export type RawParticipantRow = Record<string, unknown>;
