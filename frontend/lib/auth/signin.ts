import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { getFirebaseAuthError } from './firebaseError';

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔥 signin user:', userCredential.user);
    }

    return userCredential.user;
  } catch (error: unknown) {
    throw new Error(getFirebaseAuthError(error));
  }
}
