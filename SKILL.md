---
description: Google Sheetsのストーリーボード（スプシURL or ローカルCSV）からNanoBanana用プロンプトシートを抽出・生成する。「プロンプトシート」「NanoBananaプロンプト抽出」「スプシからプロンプト」「プロンプト一覧」等のキーワードで使用。
---

# NanoBanana プロンプトシート生成スキル

ストーリーボードのスプレッドシート（Google Sheets URL）またはローカルCSVから、NanoBanana用のプロンプトだけを抽出し、コピペしやすいテキスト形式で出力するスキル。

---

## トリガーキーワード

「プロンプトシート」「NanoBananaプロンプト抽出」「スプシからプロンプト」「プロンプト一覧」「NanoBanana用に抽出」

---

## 入力（2パターン）

### パターン1：Google Sheets URL
ユーザーがスプレッドシートのURLを貼る。

```
このスプシからプロンプトシート作って
https://docs.google.com/spreadsheets/d/XXXXX/edit?gid=YYYYYY#gid=YYYYYY
```

### パターン2：ローカルCSV
ユーザーがローカルのCSVファイルパスを指定する。

```
このCSVからプロンプトシート作って
C:\KEI IWASAKI\XXX_ストーリーボード.csv
```

---

## 出力形式

**テキストファイル**（`.txt`）— NanoBananaにそのままコピペできる形式。

### ブロック構成（1カットあたり）

```
────────────────────────────────────────────────────────────
【カット{番号}】{セクション名}
────────────────────────────────────────────────────────────

▼ 台本（参考）
{ナレーション全文}

▼ プロンプト パターン1（↓これをコピペ）
{NanoBanana パターン1}

▼ プロンプト パターン2（↓これをコピペ）
{NanoBanana パターン2}

```

### ファイルヘッダー

```
# NanoBanana プロンプトシート
# 「{タイトル}」ストーリーボード
# 使い方: 各ブロックのプロンプト部分をそのままNanoBananaに貼り付けてください
================================================================================
```

---

## 列のマッピング

ストーリーボードCSVの列構成（storyboard スキル準拠）:

| CSV列 | インデックス | 用途 |
|---|---|---|
| A: カット番号 | 0 | 【カットN】の番号 |
| B: セクション | 1 | セクション名 |
| D: ナレーション | 3 | 台本（参考）テキスト |
| H: NanoBanana パターン1 | 7 | プロンプト パターン1 |
| I: NanoBanana パターン2 | 8 | プロンプト パターン2 |

> **注意**: 列がずれている場合（カスタムスプシ等）は、ユーザーに確認してからマッピングを調整する。

---

## 処理手順

### Google Sheets URLの場合

1. URLから `spreadsheet_id` と `gid` を抽出
2. CSV形式でダウンロード:
   ```
   https://docs.google.com/spreadsheets/d/{id}/export?format=csv&gid={gid}
   ```
   PowerShellの `Invoke-WebRequest` を使用:
   ```powershell
   Invoke-WebRequest -Uri '{url}' -OutFile 'raw_storyboard.csv'
   ```
3. Node.jsスクリプトでCSVをパース → テキスト出力

### ローカルCSVの場合

1. 指定されたCSVを直接Node.jsスクリプトで読み込み
2. テキスト出力

---

## Node.js スクリプトテンプレート

```javascript
const fs = require('fs');

// CSVパーサー（クォート内カンマ・改行対応）
function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const row = [];
    while (i < text.length) {
      let val = '';
      if (text[i] === '"') {
        i++;
        while (i < text.length) {
          if (text[i] === '"' && text[i+1] === '"') { val += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; }
          else { val += text[i]; i++; }
        }
      } else {
        while (i < text.length && text[i] !== ',' && text[i] !== '\r' && text[i] !== '\n') {
          val += text[i]; i++;
        }
      }
      row.push(val);
      if (i < text.length && text[i] === ',') { i++; }
      else break;
    }
    if (text[i] === '\r') i++;
    if (text[i] === '\n') i++;
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

const raw = fs.readFileSync('{入力CSV}', 'utf-8');
const rows = parseCSV(raw);

const sep = '────────────────────────────────────────────────────────────';
let out = `# NanoBanana プロンプトシート\n`;
out += `# 「{タイトル}」ストーリーボード\n`;
out += `# 使い方: 各ブロックのプロンプト部分をそのままNanoBananaに貼り付けてください\n`;
out += `================================================================================\n\n`;

let count = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (row.length < 9) continue;

  const cutNo   = row[0].trim();  // A: カット番号
  const section = row[1].trim();  // B: セクション
  const narr    = row[3].trim();  // D: ナレーション
  const nb1     = row[7].trim();  // H: NanoBanana パターン1
  const nb2     = row[8].trim();  // I: NanoBanana パターン2

  // 両パターンとも空 or 画面収録のみのカットはスキップ
  if ((!nb1 || nb1 === '（実際の画面収録を使用）') &&
      (!nb2 || nb2 === '（実際の画面収録を使用）')) continue;

  count++;
  out += `${sep}\n【カット${cutNo}】${section}\n${sep}\n\n`;
  out += `▼ 台本（参考）\n${narr.replace(/\*\*/g, '')}\n\n`;

  if (nb1 && nb1 !== '（実際の画面収録を使用）') {
    out += `▼ プロンプト パターン1（↓これをコピペ）\n${nb1}\n\n`;
  }
  if (nb2 && nb2 !== '（実際の画面収録を使用）') {
    out += `▼ プロンプト パターン2（↓これをコピペ）\n${nb2}\n\n`;
  }
  out += `\n`;
}

fs.writeFileSync('{出力パス}', out, 'utf-8');
console.log(`Done! ${count} cuts written`);
```

---

## 出力ファイル名の規則

```
{元のスプシ名 or CSV名}_NanoBananaプロンプト.txt
```

出力先は元のCSVと同じディレクトリ、またはユーザー指定のディレクトリ。

---

## 注意事項

- `**太字**` のマークダウン記法はナレーション表示時に除去する
- 画面収録カット（プロンプトが「（実際の画面収録を使用）」）はスキップ
- パターン1のみ / パターン2のみの場合は、あるものだけ出力
- BOM不要（テキストファイルなので）
- Google Sheetsが読み込めない場合は `read_url_content` でCSVエクスポートURLからチャンク取得を試す
