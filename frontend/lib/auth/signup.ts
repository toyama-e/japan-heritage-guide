import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import { getFirebaseAuthError } from './firebaseError';

export async function signUp(
  email: string,
  password: string,
  nickname: string,
) {
  try {
    if (!nickname.trim()) {
      throw new Error('ニックネームを入力してください');
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // ニックネームを ディスプレイネーム に保存
    await updateProfile(user, {
      displayName: nickname,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔥 signup user:', userCredential.user);
      console.log('🔥 nickname:', nickname);
    }
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(getFirebaseAuthError(error));
  }
}
