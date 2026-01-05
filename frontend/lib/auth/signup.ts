import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { getFirebaseAuthError } from './firebaseError';

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔥 signup user:', userCredential.user);
    }
    return userCredential.user;
  } catch (error: unknown) {
    throw new Error(getFirebaseAuthError(error));
  }
}
