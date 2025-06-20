import { User } from '../apis/user/types';
import { userAtom } from '../atoms/user';
import { useAtomValue } from 'jotai';

/**
 * 현재 로그인한 사용자 정보를 가져오는 훅
 * @returns 로그인한 사용자 정보 또는 null
 */
export function useCurrentUser(): User | null {
  const user = useAtomValue(userAtom);
  return user;
}
