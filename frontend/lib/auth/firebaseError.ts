import { FirebaseError } from 'firebase/app';

export function getFirebaseAuthError(error: unknown): string {
  // 1. FirebaseError でない場合の処理
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error) return error.message;
    return '不明なエラーが発生しました';
  }

  switch (error.code) {
    // 登録・更新
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください';

    // ログイン・認証
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': // Firebase v10以降の統合エラー
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'auth/user-disabled':
      return 'このアカウントは無効化されています';

    // セキュリティ・制限
    case 'auth/too-many-requests':
      return '短時間に何度も失敗したため、一時的にブロックされました。時間を置いてからお試しください';
    case 'auth/requires-recent-login':
      return 'セキュリティ保護のため、一度ログアウトしてから再ログインして再度お試しください';

    // 操作・ネットワーク
    case 'auth/operation-not-allowed':
      return 'この認証方法は現在許可されていません。管理者に連絡してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。通信環境を確認してください';
    case 'auth/expired-action-code':
      return '期限切れ、または既に使用されたリンクです';

    default:
      console.error(`Unhandled Firebase Error: ${error.code}`); // 未知のエラーをログに出力
      return '認証に失敗しました。時間をおいて再度お試しください';
  }
}
