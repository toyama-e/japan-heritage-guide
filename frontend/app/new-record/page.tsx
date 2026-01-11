'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiFetchResponse } from '../../lib/apiFetch';
import Link from 'next/link';
import { AuthLoginCheck } from '../../components/auth/authLoginCheck';

type HeritageOption = {
  id: number;
  name: string;
};

// 返却は VisitOut（最低限必要なものだけ型にしてOK）
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

function isDateRangeValid(from: string, to: string) {
  if (!from || !to) return false;
  return from <= to; // yyyy-mm-dd なので文字列比較でOK
}

// ★ コンポーネント外（毎回再定義しない）
function extractDetailMessage(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return '入力内容に誤りがあります';
  return null;
}

// ★ コンポーネント外
async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function NewRecordPage() {
  const [heritages, setHeritages] = useState<HeritageOption[]>([]);
  const [heritagesLoading, setHeritagesLoading] = useState(true);
  const [heritagesError, setHeritagesError] = useState<string | null>(null);

  // select風プルダウン用
  const [isOpen, setIsOpen] = useState(false);

  // 「選択状態」は id だけ持つ（name は後で計算して出す）
  const [selectedHeritageId, setSelectedHeritageId] = useState<number | null>(
    null,
  );

  // id から表示名を計算して作る（stateにしない）
  const selectedHeritageName = useMemo(() => {
    if (selectedHeritageId === null) return '';
    return heritages.find((h) => h.id === selectedHeritageId)?.name ?? '';
  }, [heritages, selectedHeritageId]);

  const [visitedFrom, setVisitedFrom] = useState('');
  const [visitedTo, setVisitedTo] = useState('');

  // 訪問登録が完了したか（登録ボタンを押して成功した扱いにできたか）
  const [isVisitSaved, setIsVisitSaved] = useState(false);

  // 通信状態/メッセージ
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 何か入力（下書き）があるか：未保存の確認に使う
  const hasDraft =
    selectedHeritageId !== null || visitedFrom !== '' || visitedTo !== '';

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

        const data = await apiFetchResponse('/api/v1/heritages');

        if (!data.ok) {
          setHeritagesError(`取得に失敗しました（${data.status}）`);
          return;
        }

        const json = (await data.json()) as {
          id: number;
          name: string;
        }[];

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
        setMessage('訪問登録しました');
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
      <div className="mx-auto max-w-sm px-6 pt-10">
        <header className="mb-6 text-center">
          <h1 className="text-xl font-bold">訪問登録</h1>
          <p className="mt-2 text-sm text-gray-500">
            訪問した世界遺産と日付を登録します
          </p>
          <p className="mt-2 text-sm text-gray-500">
            訪問を登録するとバッジが解放されます
          </p>
        </header>

        <Card>
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
              onClick={async () => {
                await saveVisit();
              }}
            >
              {submitting ? '送信中...' : '訪問登録'}
            </Button>

            {/* 日記導線 */}
            <div className="mt-3">
              <Link href="/diaries" className="w-full max-w-sm">
                <Button
                  disabled={submitting}
                  onClick={async () => {
                    if (isVisitSaved) {
                      alert('日記作成へ');
                      return;
                    }

                    if (!hasDraft) {
                      alert('日記作成へ');
                      return;
                    }

                    const doSave = window.confirm(
                      '訪問登録がまだ完了していません。\n訪問登録してから日記を作成しますか？',
                    );

                    if (doSave) {
                      const ok = await saveVisit();
                      if (!ok) return;
                      alert('日記作成へ（遷移に置き換え）');
                      return;
                    }

                    const discard = window.confirm(
                      '入力内容を破棄して日記作成に進みますか？',
                    );

                    if (discard) {
                      setSelectedHeritageId(null);
                      setVisitedFrom('');
                      setVisitedTo('');
                      setIsVisitSaved(false);
                      setMessage(null);
                      alert('日記作成へ');
                    }
                  }}
                >
                  日記を作成する
                </Button>
              </Link>
            </div>

            {/* 獲得バッジ導線 */}
            <div className="mt-3">
              <Link href="/get-badges" className="w-full max-w-sm">
                <Button className="w-full">獲得したバッジを見る</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AuthLoginCheck>
  );
}
