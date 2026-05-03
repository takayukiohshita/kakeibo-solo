import { NextRequest, NextResponse } from 'next/server';

const CAT_NAMES = ['食費','日用品','衣服','美容品','交際費','医療費','教育費','交通費','通信費','保険料','旅行費','筋トレ'];

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 });
  }

  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: '画像データがありません' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `このレシート画像を読み取って、以下のJSON形式で返してください。必ずJSONのみを返し、説明文は不要です。

{
  "date": "YYYY-MM-DD形式の日付（レシートに日付がなければ今日の日付）",
  "amount": 合計金額の数値（税込、数値のみ）,
  "memo": "店名または内容（例：イオン、松屋など）",
  "cat": "以下のカテゴリから最も適切なもの1つ: ${CAT_NAMES.join('・')}"
}

読み取れない場合は各フィールドをnullにしてください。`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'レシートの読み取りに失敗しました' }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '読み取り中にエラーが発生しました' }, { status: 500 });
  }
}
