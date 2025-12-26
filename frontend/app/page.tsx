import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-sm px-6 pt-10">
      {/* ヘッダーは作らない前提なので、上部は余白で調整 */}
      <header className="mb-8 text-center">
        {/* <p className="text-xs text-gray-500">トップページ</p> */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight">いさんぽ</h1>
        <p className="text-lg text-gray-700">Japan</p>
        <p className="mt-3 text-sm text-gray-600">知る、という贅沢な旅へ。</p>
      </header>

      {/* 2つの導線カード（仮） */}
      <section
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
      >
        <Card className="card">
          <p className="card-title">世界遺産を</p>
          <p className="card-title">さがす</p>
        </Card>

        <Card className="card">
          <p className="card-title">日記を</p>
          <p className="card-title">見る</p>
        </Card>
      </section>

      {/* ボタン導線 */}
      <section className="mt-8 space-y-3">
        <Button>ログインする</Button>
        <Button>マイページを作る</Button>
      </section>
    </div>
  );
}
