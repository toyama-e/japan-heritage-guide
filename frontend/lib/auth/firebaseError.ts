import { FirebaseError } from 'firebase/app';

export function getFirebaseAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return '不明なエラーが発生しました';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが違います';
    default:
      return '認証に失敗しました';
  }
}
