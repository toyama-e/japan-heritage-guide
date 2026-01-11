'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiFetchResponse } from '../../lib/apiFetch';
import Link from 'next/link';
import { AuthLoginCheck } from '../../components/auth/authLoginCheck';
import { useRouter } from 'next/navigation';
import { BadgeCard } from '../../components/ui/BadgeCard';

type VisitOut = {
  id: number;
  user_id: number;
  world_heritage_id: number;
  visited_from: string; // "YYYY-MM-DD"
  visited_to: string; // "YYYY-MM-DD"
};

type FastApiError = {
  detail?: unknown;
};

type Heritage = {
  id: number;
  name: string;
  badge_image_url: string | null;
};

type Badge = {
  id: number;
  no: string;
  name: string;
  imageUrl: string;
  unlocked: boolean;
};

function isDateRangeValid(from: string, to: string) {
  if (!from || !to) return false;
  return from <= to;
}

// コンポーネント外（毎回再定義しない）
function extractDetailMessage(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return '入力内容に誤りがあります';
  return null;
}

// コンポーネント外
async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// 「No.001」みたいな表示を作る helper
function toNo(id: number) {
  return `No.${String(id).padStart(3, '0')}`;
}

export default function NewRecordPage() {
  const router = useRouter();

  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [heritagesLoading, setHeritagesLoading] = useState(true);
  const [heritagesError, setHeritagesError] = useState<string | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  // select風プルダウン用
  const [isOpen, setIsOpen] = useState(false);

  // 「選択状態」は id だけ持つ
  const [selectedHeritageId, setSelectedHeritageId] = useState<number | null>(
    null,
  );

  // id から表示名を計算
  const selectedHeritageName = useMemo(() => {
    if (selectedHeritageId === null) return '';
    return heritages.find((h) => h.id === selectedHeritageId)?.name ?? '';
  }, [heritages, selectedHeritageId]);

  const [visitedFrom, setVisitedFrom] = useState('');
  const [visitedTo, setVisitedTo] = useState('');

  // 訪問登録が完了したか
  const [isVisitSaved, setIsVisitSaved] = useState(false);

  // 通信状態/メッセージ
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit =
    selectedHeritageId !== null &&
    visitedFrom.trim() !== '' &&
    visitedTo.trim() !== '' &&
    isDateRangeValid(visitedFrom, visitedTo);

  // 開始日を変えたら「保存済み」を解除＆終了日が矛盾したらリセット
  const handleChangeFrom = (value: string) => {
    setIsVisitSaved(false);
    setMessage(null);
    setVisitedFrom(value);

    if (visitedTo && visitedTo < value) {
      setVisitedTo('');
    }
  };

  // 終了日を変えたら「保存済み」を解除
  const handleChangeTo = (value: string) => {
    setIsVisitSaved(false);
    setMessage(null);
    setVisitedTo(value);
  };

  // GET /api/v1/heritages を読む
  useEffect(() => {
    const loadHeritages = async () => {
      try {
        setHeritagesLoading(true);
        setHeritagesError(null);
        console.log(
          'heritages ids:',
          heritages.map((h) => h.id),
        );
        const res = await apiFetchResponse('/api/v1/heritages');

        if (!res.ok) {
          setHeritagesError(`取得に失敗しました（${res.status}）`);
          return;
        }

        // badge_image_url も受け取る
        const json = (await res.json()) as Heritage[];
        setHeritages(json);
      } catch (e) {
        setHeritagesError(
          e instanceof Error ? e.message : '世界遺産の取得に失敗しました',
        );
      } finally {
        setHeritagesLoading(false);
      }
    };

    loadHeritages();
  }, []);

  const saveVisit = async (): Promise<boolean> => {
    if (selectedHeritageId === null) {
      setMessage('世界遺産を選択してください');
      return false;
    }
    if (!visitedFrom || !visitedTo) {
      setMessage('訪問日（開始・終了）を入力してください');
      return false;
    }
    if (visitedTo < visitedFrom) {
      setMessage('終了日は開始日以降にしてください');
      return false;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await apiFetchResponse('/api/v1/visits', {
        method: 'POST',
        body: {
          world_heritage_id: selectedHeritageId,
          visited_from: visitedFrom,
          visited_to: visitedTo,
        },
      });

      // ✅ 成功
      if (res.status === 201) {
        await safeReadJson<VisitOut>(res);
        setIsVisitSaved(true);

        const h = heritages.find((x) => x.id === selectedHeritageId);

        // 獲得バッジを特定してポップアップ表示
        if (h) {
          const badge: Badge = {
            id: h.id,
            no: toNo(h.id),
            name: h.name,
            imageUrl:
              h.badge_image_url ??
              'http://localhost:8000/static/badges/placeholder.png',
            unlocked: true,
          };

          setEarnedBadge(badge);
          setShowPopup(true);
        }
        return true;
      }

      // 🚫 重複
      if (res.status === 409) {
        const err = await safeReadJson<FastApiError>(res);
        setIsVisitSaved(false);
        setMessage(
          extractDetailMessage(err?.detail) ?? 'すでに訪問登録されています',
        );
        return false;
      }

      // 🚫 認証不足
      if (res.status === 401) {
        const err = await safeReadJson<FastApiError>(res);
        setIsVisitSaved(false);
        setMessage(extractDetailMessage(err?.detail) ?? 'ログインが必要です');
        return false;
      }

      // 🚫 バリデーション
      if (res.status === 422) {
        const err = await safeReadJson<FastApiError>(res);
        setIsVisitSaved(false);
        setMessage(
          extractDetailMessage(err?.detail) ?? '入力内容に誤りがあります',
        );
        return false;
      }

      // 🚫 その他
      const fallbackText = await res.text().catch(() => '');
      setIsVisitSaved(false);
      setMessage(
        fallbackText
          ? `訪問登録に失敗しました（${res.status}）: ${fallbackText}`
          : `訪問登録に失敗しました（${res.status}）`,
      );
      return false;
    } catch (e) {
      setIsVisitSaved(false);
      setMessage(e instanceof Error ? e.message : '訪問登録に失敗しました');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLoginCheck>
      <div className="mx-auto max-w-sm px-6 pt-10 text-[15px] text-gray-900">
        <header className="mb-6 text-center">
          <h1 className="text-xl font-bold">訪問登録</h1>
          <p className="mt-2 text-sm text-gray-500">
            訪問した世界遺産と日付を登録します
          </p>
          <p className="mt-2 text-sm text-gray-500">
            訪問を登録するとバッジが解放されます
          </p>
        </header>

        <Card className="bg-white">
          {/* 世界遺産選択（select風） */}
          <div className="relative">
            <p className="text-sm font-medium">世界遺産</p>

            <button
              type="button"
              className="mt-2 w-full text-left"
              onClick={() => setIsOpen((v) => !v)}
            >
              <Input
                value={selectedHeritageName}
                onChange={() => {}}
                placeholder="世界遺産を選択"
              />
            </button>

            {heritagesLoading && (
              <p className="mt-2 text-xs text-gray-500">
                世界遺産を読み込み中...
              </p>
            )}

            {heritagesError && (
              <p className="mt-2 text-xs text-red-500">{heritagesError}</p>
            )}

            {isOpen && (
              <div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow">
                {heritages.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className={
                      selectedHeritageId === h.id
                        ? 'block w-full bg-gray-100 px-3 py-2 text-left text-sm font-medium'
                        : 'block w-full px-3 py-2 text-left text-sm hover:bg-gray-100'
                    }
                    onClick={() => {
                      setSelectedHeritageId(h.id);
                      setIsVisitSaved(false);
                      setMessage(null);
                      setIsOpen(false);
                    }}
                  >
                    {h.id}: {h.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 訪問日 */}
          <div className="mt-6">
            <p className="text-sm font-medium">訪問日</p>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs text-gray-500">開始</p>
                <Input
                  type="date"
                  value={visitedFrom}
                  onChange={handleChangeFrom}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500">終了</p>
                <Input
                  type="date"
                  min={visitedFrom}
                  value={visitedTo}
                  onChange={handleChangeTo}
                />
              </div>
            </div>

            {!isDateRangeValid(visitedFrom, visitedTo) &&
              visitedFrom &&
              visitedTo && (
                <p className="mt-2 text-xs text-red-500">
                  終了日は開始日以降にしてください
                </p>
              )}
          </div>

          {/* メッセージ */}
          {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

          {/* 登録ボタン */}
          <div className="mt-6">
            <Button
              disabled={!canSubmit || submitting}
              className="w-full bg-black text-white hover:bg-black/90 disabled:bg-black/40"
              onClick={async () => {
                await saveVisit();
              }}
            >
              {submitting ? '送信中...' : '訪問登録'}
            </Button>

            {/* 日記導線 */}
            <div className="mt-3 w-full max-w-sm">
              {!isVisitSaved && (
                <p className="mt-2 text-xs text-gray-500">
                  日記を作成するには、先に訪問登録を完了してください
                </p>
              )}
              <Button
                disabled={!isVisitSaved || submitting}
                className="w-full bg-black text-white hover:bg-black/90 disabled:bg-black/40"
                onClick={() => {
                  router.push('/diaries');
                }}
              >
                日記を作成する
              </Button>
            </div>
          </div>
        </Card>

        {/* ポップアップ */}
        {showPopup && earnedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="w-full max-w-sm rounded-2xl bg-[#fbf7ef] shadow-xl ring-1 ring-black/10">
              {/* ヘッダー（固定） */}
              <div className="flex items-start justify-between gap-3 border-b border-black/10 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    新しいバッジを解放
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1b1b1b]">
                    バッジを獲得しました！
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-black/5"
                  aria-label="閉じる"
                >
                  ✕
                </button>
              </div>

              {/* 本文（ここだけスクロール） */}
              <div className="max-h-[70vh] overflow-y-auto p-4">
                <div className="mx-auto w-full max-w-[280px]">
                  <BadgeCard badge={earnedBadge} />
                </div>

                {/* 獲得バッジページへの導線 */}
                <div className="mt-5">
                  <Link href="/get-badges" className="block w-full">
                    <Button
                      className="w-full bg-white text-black ring-1 ring-black/20 hover:bg-black/5"
                      onClick={() => setShowPopup(false)}
                    >
                      獲得したバッジを見る
                    </Button>
                  </Link>
                </div>

                {/* 閉じる */}
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="mt-3 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthLoginCheck>
  );
}
