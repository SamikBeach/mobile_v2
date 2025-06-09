import { useAtomValue } from 'jotai';
import { userAtom } from '../atoms/user';

/**
 * 현재 보고 있는 프로필이 자신의 프로필인지 확인하는 훅
 * @param userId 확인할 사용자 ID
 * @returns boolean - 자신의 프로필인 경우 true, 아닌 경우 false
 */
export function useIsMyProfile(userId?: number): boolean {
  const currentUser = useAtomValue(userAtom);

  // 로그인한 사용자가 없거나 프로필 ID가 없는 경우 false 반환
  if (!currentUser || !userId) {
    return false;
  }

  // 현재 사용자 ID와 프로필 ID 비교
  return currentUser.id === userId;
}
