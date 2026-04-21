import type { Participant, RawParticipantRow } from '../../types/participant';

const FIELD_ALIASES = {
  name: ['이름', '성명', '참가자', 'name', 'fullname', 'participant', 'candidate'],
  affiliation: [
    '학과', '전공', 'major', 'department',
    '단과대학', 'college', 'school', '학교',
    '소속', 'affiliation', 'organization', 'company', '회사', '기관', 'team',
  ],
  email: ['이메일', 'email', 'mail'],
  phone: ['휴대폰', '연락처', '전화', 'mobile', 'phone'],
} as const;

const PREFERRED_SHEET = '정리';

export type ParseResult = {
  participants: Participant[];
  droppedRows: number;
  duplicateRows: number;
  rawRows: number;
};

export async function parseSpreadsheetFile(file: File): Promise<ParseResult> {
  if (file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv')) {
    return sanitizeRows(parseDelimitedRows(await file.text()));
  }

  const { readSheet } = await import('read-excel-file/browser');
  const rows = await readPreferredSheet(readSheet, file);
  return sanitizeRows(rowsToObjects(rows));
}

async function readPreferredSheet(
  readSheet: (input: File, sheet?: number | string) => Promise<unknown[][]>,
  file: File
): Promise<unknown[][]> {
  try {
    return await readSheet(file, PREFERRED_SHEET);
  } catch {
    return await readSheet(file);
  }
}

export async function parsePastedParticipants(value: string): Promise<ParseResult> {
  const trimmed = value.trim();
  if (!trimmed) {
    return { participants: [], droppedRows: 0, duplicateRows: 0, rawRows: 0 };
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return sanitizeRows(rows as RawParticipantRow[]);
  }

  return sanitizeRows(parseDelimitedRows(trimmed));
}

export function sanitizeRows(rows: RawParticipantRow[]): ParseResult {
  const participants: Participant[] = [];
  const seen = new Set<string>();
  let droppedRows = 0;
  let duplicateRows = 0;

  rows.forEach((row, index) => {
    const fields = mapFields(row);
    const name = cleanText(fields.name);
    if (!name) {
      droppedRows += 1;
      return;
    }

    const affiliation = cleanText(fields.affiliation);
    const email = cleanEmail(fields.email);
    const phone = cleanText(fields.phone);
    const dedupeKey = email || `${normalizeForKey(name)}::${normalizeForKey(affiliation)}`;

    if (seen.has(dedupeKey)) {
      duplicateRows += 1;
      return;
    }

    seen.add(dedupeKey);
    participants.push({
      id: `p-${index + 1}-${hashId(dedupeKey)}`,
      name,
      affiliation: affiliation || undefined,
      email: email || undefined,
      phone: phone || undefined,
      metadata: row,
    });
  });

  return {
    participants,
    droppedRows,
    duplicateRows,
    rawRows: rows.length,
  };
}

export function generateMockParticipants(count = 700): Participant[] {
  const familyNames = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Yoon', 'Han', 'Shin', 'Oh'];
  const givenNames = ['Minsoo', 'Jiwon', 'Seoyeon', 'Hyunwoo', 'Hana', 'Jiho', 'Yuna', 'Doyun', 'Ara', 'Joon'];
  const affiliations = ['NVIDIA Partner', 'Seoul AI Lab', 'KAIST', 'SNU', 'Yonsei', 'Korea Univ.', 'DGX Cloud Team'];

  return Array.from({ length: count }, (_, index) => {
    const name = `${familyNames[index % familyNames.length]} ${givenNames[(index * 7) % givenNames.length]} ${String(
      index + 1
    ).padStart(3, '0')}`;
    const affiliation = affiliations[(index * 5) % affiliations.length];
    return {
      id: `mock-${index + 1}`,
      name,
      affiliation,
      email: `candidate${index + 1}@example.com`,
    };
  });
}

function mapFields(row: RawParticipantRow) {
  const entries = Object.entries(row);
  const indexed = entries.map(([key, value]) => ({
    tokens: tokenizeHeader(key),
    value,
  }));
  return {
    name: findValue(indexed, FIELD_ALIASES.name) ?? entries[0]?.[1],
    affiliation: findValue(indexed, FIELD_ALIASES.affiliation),
    email: findValue(indexed, FIELD_ALIASES.email),
    phone: findValue(indexed, FIELD_ALIASES.phone),
  };
}

function parseDelimitedRows(text: string): RawParticipantRow[] {
  return rowsToObjects(parseDelimitedMatrix(text));
}

function parseDelimitedMatrix(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      isQuoted = !isQuoted;
    } else if (char === ',' && !isQuoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !isQuoted) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((cells) => cells.some((value) => cleanText(value)));
}

function rowsToObjects(rows: unknown[][]): RawParticipantRow[] {
  if (!rows.length) return [];
  const headers = rows[0].map((value, index) => cleanText(value) || `column_${index + 1}`);

  return rows.slice(1).map((row) => {
    const record: RawParticipantRow = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

type IndexedHeader = { tokens: Set<string>; value: unknown };

function findValue(indexed: IndexedHeader[], aliases: readonly string[]) {
  for (const alias of aliases) {
    const match = indexed.find(({ tokens }) => tokens.has(alias));
    if (match) return match.value;
  }
  return undefined;
}

function tokenizeHeader(value: string): Set<string> {
  const normalized = String(value ?? '').normalize('NFKC').toLowerCase();
  const matches = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(matches);
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ');
}

function cleanEmail(value: unknown): string {
  return cleanText(value).toLowerCase();
}

function normalizeForKey(value: string) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hashId(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(31, hash) + input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
