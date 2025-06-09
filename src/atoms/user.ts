import { atom } from 'jotai';
import { User } from '../apis/user/types';

// 사용자 정보를 관리하는 atom
export const userAtom = atom<User | null>(null);
