import { atom } from 'jotai';
import { User } from '../apis/user/types';

export const userAtom = atom<User | null>(null);
