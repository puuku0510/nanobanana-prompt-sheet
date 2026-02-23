# 🎨 NanoBanana プロンプトシート生成スキル

Google Sheetsのストーリーボード（またはローカルCSV）から、**NanoBanana用のプロンプトだけを抽出**して、コピペしやすいテキスト形式で出力する [Antigravity](https://antigravity.dev) スキルです。

## ✨ 特徴

- ⚡ **高速** — 同梱スクリプトで一発変換（CSVダウンロード3秒＋変換0.1秒）
- 🎯 **余計なもの無し** — SUYA撮影・画面収録カットは自動スキップ
- 📋 **パターン1/2を分離** — そのままNanoBananaに2パターン分コピペ可能
- ✅ **最終チェック** — D列(ナレーション)・H列(パターン1)・I列(パターン2)の抜け漏れを自動検出

## 📦 インストール

```bash
cd ~/.gemini/antigravity/skills/
git clone https://github.com/puuku0510/nanobanana-prompt-sheet.git
```

## 🚀 使い方

Antigravity に以下のように話しかけるだけ：

### Google Sheets から抽出

```
このスプシからプロンプトシート作って
https://docs.google.com/spreadsheets/d/XXXXX/edit?gid=YYYYYY
```

### ローカルCSV から抽出

```
このCSVからプロンプトシート作って
```

### トリガーキーワード

- 「プロンプトシート」
- 「NanoBananaプロンプト抽出」
- 「スプシからプロンプト」
- 「プロンプト一覧」

## 📄 出力フォーマット

```
【カット1】P1:冒頭フック
昨日、3時間で150枚のスライドを作りました。

▼ パターン1
暗闇の中から「3時間で150枚」という巨大な金色の数字が...

▼ パターン2
ダークグラデーション背景に「150枚」の数字がメタリックに...

---
```

- **パターン1 / パターン2** が分かれているので、好きな方をNanoBananaにコピペ
- SUYA撮影・画面収録のカットは自動的にスキップ

## ✅ 最終チェック機能

スクリプト実行後、D・H・I列の抜け漏れを自動レポート：

```
✅ 完了！ 52 カット → スライド爆速_NanoBananaプロンプト.txt
   📊 全100行 → プロンプトあり: 52 / SUYA等スキップ: 48
   ✅ D列・H列・I列の抜け漏れなし
```

抜けがある場合は警告が出ます：

```
⚠ 抜け漏れ検出 (2件):
   ⚠ カット15: H列（パターン1）が空
   ⚠ カット23: I列（パターン2）が空
```

## 🗂 ファイル構成

```
nanobanana-prompt-sheet/
├── SKILL.md                           ← スキル本体
├── README.md                          ← このファイル
├── LICENSE                            ← MIT License
├── .gitignore
└── scripts/
    └── gen_nanobanana_sheet.js         ← 一発変換スクリプト
```

## 📋 対応するスプレッドシート列構成

| 列 | 内容 | 使用 |
|---|---|---|
| A | カット番号 | ✅ |
| B | セクション | ✅ |
| D | ナレーション | ✅ |
| H | NanoBanana パターン1 | ✅ |
| I | NanoBanana パターン2 | ✅ |

## ⚙️ 前提条件

- [Antigravity](https://antigravity.dev) がインストール済み
- Node.js が利用可能
- Google Sheets を使う場合、シートが「リンクを知っている全員が閲覧可」に設定されていること

## 📝 ライセンス

MIT License
