/**
 * NanoBanana プロンプトシート生成ツール
 * 
 * ストーリーボードCSVからNanoBanana用プロンプトをテキスト形式で抽出する。
 * SUYA撮影・SUYA準備・画面収録のカットは自動スキップ。
 * 
 * 使い方:
 *   node gen_nanobanana_sheet.js <入力CSV> [出力ファイル]
 * 
 * 列マッピング（storyboard スキル準拠）:
 *   A(0): カット番号, B(1): セクション, D(3): ナレーション,
 *   H(7): NanoBanana パターン1, I(8): NanoBanana パターン2
 */

const fs = require('fs');

// ─── CSVパーサー（クォート内カンマ・改行対応）───
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
                    if (text[i] === '"' && text[i + 1] === '"') { val += '"'; i += 2; }
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

// ─── スキップ判定 ───
function shouldSkip(text) {
    if (!text) return true;
    const t = text.trim();
    if (!t) return true;
    // SUYA撮影、SUYA準備、画面収録、実際の画面収録を使用 → スキップ
    if (/SUYA/i.test(t)) return true;
    if (/実際の画面収録を使用/.test(t)) return true;
    return false;
}

// ─── 引数チェック ───
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('使い方: node gen_nanobanana_sheet.js <入力CSV> [出力ファイル]');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.csv$/i, '_NanoBananaプロンプト.txt');

if (!fs.existsSync(inputFile)) {
    console.error(`エラー: ファイルが見つかりません: ${inputFile}`);
    process.exit(1);
}

// ─── メイン処理 ───
const raw = fs.readFileSync(inputFile, 'utf-8');
const rows = parseCSV(raw);

let out = '';
let count = 0;

for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 9) continue;

    const cutNo = row[0].trim();  // A: カット番号
    const section = row[1].trim();  // B: セクション
    const narr = row[3].trim();  // D: ナレーション
    const nb1 = row[7].trim();  // H: NanoBanana パターン1
    const nb2 = row[8].trim();  // I: NanoBanana パターン2

    // 両方ともスキップ対象なら飛ばす
    if (shouldSkip(nb1) && shouldSkip(nb2)) continue;

    count++;
    out += `【カット${cutNo}】${section}\n`;
    out += `${narr.replace(/\*\*/g, '')}\n\n`;

    if (!shouldSkip(nb1)) {
        out += `${nb1}\n\n`;
    }
    if (!shouldSkip(nb2)) {
        out += `${nb2}\n\n`;
    }
    out += `---\n\n`;
}

fs.writeFileSync(outputFile, out, 'utf-8');
console.log(`✅ 完了！ ${count} カット → ${outputFile}`);
