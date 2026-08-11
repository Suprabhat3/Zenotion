// NOTE: This is a scaffold that delegates to lib/notes. Phase 1 will migrate logic here.
import { Note } from '../../types';
import * as NotesLib from '../../lib/notes';

export async function getNotesForUser(userId: string): Promise<Note[]> {
  // existing lib provides data access; keep compatibility
  if (typeof (NotesLib as any).getAllNotesForUser === 'function') {
    return (await (NotesLib as any).getAllNotesForUser(userId)) as Note[];
  }
  return [];
}

export async function createNote(userId: string, payload: Partial<Note>) {
  if (typeof (NotesLib as any).createNote === 'function') {
    return (NotesLib as any).createNote(userId, payload);
  }
  throw new Error('createNote not implemented in lib/notes');
}

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>