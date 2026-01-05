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

  const [selectedHeritageId, setSelectedHeritageId] = useState<number | null>(
    null,
  );
  const [selectedHeritageName, setSelectedHeritageName] = useState('');

  const [visitedFrom, setVisitedFrom] = useState('');
  const [visitedTo, setVisitedTo] = useState('');

  const canSubmit =
    selectedHeritageId !== null &&
    visitedFrom.trim() !== '' &&
    visitedTo.trim() !== '';

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

          {/* クリックで開く（入力はさせない） */}
          <div className="mt-2" onClick={() => setIsOpen((v) => !v)}>
            <Input
              value={selectedHeritageName}
              onChange={() => {}}
              placeholder="世界遺産を選択"
            />
          </div>

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
                    setSelectedHeritageName(h.name);
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
                onChange={setVisitedFrom}
              />
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500">終了</p>
              <Input type="date" value={visitedTo} onChange={setVisitedTo} />
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
            }}
          >
            訪問登録
          </Button>

          <div className="mt-3">
            <Button
              disabled={!selectedHeritageId}
              onClick={() => {
                alert('日記作成（UI確認）');
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
