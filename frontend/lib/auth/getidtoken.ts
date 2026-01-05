import { auth } from './firebase';

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const token = await user.getIdToken();
  return token;
}
