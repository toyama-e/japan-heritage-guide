'use client';

import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type HeritageOption = {
  id: number;
  name: string;
};

export default function NewRecordPage() {
  // ダミー：後で GET /api/v1/heritages に置き換える
  const heritages: HeritageOption[] = useMemo(
    () => [
      { id: 1, name: '法隆寺地域の仏教建造物' },
      { id: 2, name: '姫路城' },
      { id: 3, name: '屋久島' },
      { id: 4, name: '白川郷・五箇山の合掌造り集落' },
    ],
    [],
  );

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

  // 何か入力（下書き）があるか：未保存の確認に使う
  const hasDraft =
    selectedHeritageId !== null || visitedFrom !== '' || visitedTo !== '';

  const canSubmit =
    selectedHeritageId !== null &&
    visitedFrom.trim() !== '' &&
    visitedTo.trim() !== '';

  // 開始日を変えたら「保存済み」を解除＆終了日が矛盾したらリセット
  const handleChangeFrom = (value: string) => {
    setIsVisitSaved(false);
    setVisitedFrom(value);

    if (visitedTo && visitedTo < value) {
      setVisitedTo('');
    }
  };

  // 終了日を変えたら「保存済み」を解除
  const handleChangeTo = (value: string) => {
    setIsVisitSaved(false);
    setVisitedTo(value);
  };

  return (
    <div className="mx-auto max-w-sm px-6 pt-10">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold">訪問登録</h1>
        <p className="mt-2 text-sm text-gray-500">
          訪問した世界遺産と日付を登録します
        </p>
      </header>

      <Card>
        {/* 世界遺産選択（select風） */}
        <div className="relative">
          <p className="text-sm font-medium">世界遺産</p>

          {/* クリックできる要素は button に寄せる（読みやすい） */}
          <button
            type="button"
            className="mt-2 w-full text-left"
            onClick={() => setIsOpen((v) => !v)}
          >
            {/* Input自体は「表示専用」なので onChange は空でOK */}
            <Input
              value={selectedHeritageName}
              onChange={() => {}}
              placeholder="世界遺産を選択"
            />
          </button>

          {/* プルダウン */}
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
                    setIsOpen(false);
                  }}
                >
                  {h.name}
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
              {/* 終了日は開始日以降だけ選べる */}
              <Input
                type="date"
                min={visitedFrom}
                value={visitedTo}
                onChange={handleChangeTo}
              />
            </div>
          </div>
        </div>

        {/* 登録ボタン */}
        <div className="mt-6">
          <Button
            disabled={!canSubmit}
            onClick={() => {
              alert(
                `登録（UI確認）\nheritageId=${selectedHeritageId}\nfrom=${visitedFrom}\nto=${visitedTo}`,
              );
              // 今はUI確認なので「登録できた扱い」にする
              setIsVisitSaved(true);
            }}
          >
            訪問登録
          </Button>

          <div className="mt-3">
            <Button
              onClick={() => {
                // 1) すでに保存済みなら、そのまま日記へ
                if (isVisitSaved) {
                  alert('日記作成へ（UI確認）');
                  return;
                }

                // 2) 未入力なら、そのまま日記へ
                if (!hasDraft) {
                  alert('日記作成へ（UI確認）');
                  return;
                }

                // 3) 未保存の入力がある → まず「訪問登録する？」を聞く
                const doSave = window.confirm(
                  '訪問登録がまだ完了していません。\n訪問登録してから日記を作成しますか？',
                );

                if (doSave) {
                  // 入力が揃っていないと登録できない
                  if (!canSubmit) {
                    alert('訪問登録に必要な情報が足りません（世界遺産/日付）');
                    return;
                  }

                  // 本来はここで POST /api/v1/visits を実行 → 成功したら saved
                  alert('（UI確認）訪問登録します');
                  setIsVisitSaved(true);

                  alert('日記作成へ（UI確認）');
                  return;
                }

                // 4) 保存しない → 破棄するか聞く
                const discard = window.confirm(
                  '入力内容を破棄して日記作成に進みますか？',
                );

                if (discard) {
                  // 入力を初期化（破棄）
                  setSelectedHeritageId(null);
                  setVisitedFrom('');
                  setVisitedTo('');
                  setIsVisitSaved(false);

                  alert('日記作成へ（UI確認）');
                  return;
                }

                // 5) 破棄もしない（キャンセル）
              }}
            >
              日記を作成する
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
