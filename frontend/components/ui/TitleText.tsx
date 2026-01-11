'use client';

type Props = {
  count: number;
};

function getTitleByCount(count: number): string {
  if (count >= 26) return '世界遺産の継承者';
  if (count >= 21) return '世界遺産の守護者';
  if (count >= 16) return '世界遺産の語り部';
  if (count >= 11) return '世界遺産の案内人';
  if (count >= 6) return '世界遺産の旅人';
  if (count >= 1) return '世界遺産の一歩目';
  return '未獲得';
}

export function TitleText({ count }: Props) {
  return <span>{getTitleByCount(count)}</span>;
}
