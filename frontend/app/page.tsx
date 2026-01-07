import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-sm pt-5">
      <div className="mb-8 text-center">
        <h1 className="mb-5 text-4xl font-bold tracking-wide">
          いさんぽ JAPAN{' '}
        </h1>
        <p className="text-1xl mb-10 text-gray-600">知る、という贅沢な旅へ。</p>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/final-project-f4891.firebasestorage.app/o/world_heritage%2F17.MtFuji.jpeg?alt=media"
          alt="トップページ画像"
          className="h-60 w-full rounded-xl object-cover shadow-md"
        />
      </div>

      <section className="mb-8 grid grid-cols-2 gap-4">
        <Card className="bg-[#FBE3CF] text-center">
          <Image
            className="mx-auto mb-4"
            src="/icons/list-icon.png"
            alt="一覧から探す"
            width={48}
            height={48}
          />
          <p>
            <strong className="font-semibold text-xl">一覧 </strong>
            から
          </p>
          <p>さがす</p>
        </Card>

        <Card className="bg-[#D3D6C6] text-center">
          <Image
            className="mx-auto mb-3 mt-1"
            src="/icons/map-icon.png"
            alt="一覧から探す"
            width={48}
            height={48}
          />
          <p className="text-sm">
            <strong className="ont-semibold text-xl">マップ</strong>から
          </p>
          <p>さがす</p>
        </Card>
      </section>

      {/* ボタン導線 */}
      <section className="mt-8 space-y-3">
        <Button className="bg-[#E6DAD0]">ログイン</Button>
        <Button className="bg-white">新規登録</Button>
      </section>
    </div>
  );
}
