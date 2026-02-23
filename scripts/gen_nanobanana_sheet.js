/**
 * NanoBanana プロンプトシート生成ツール
 * 
 * ストーリーボードCSVからNanoBanana用プロンプトをテキスト形式で抽出する。
 * SUYA撮影・SUYA準備・画面収録のカットは自動スキップ。
 * 最終チェック：D列(ナレーション)・H列(パターン1)・I列(パターン2)の抜け漏れを検出。
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

// ─── スキップ判定（SUYA撮影/画面収録系） ───
function isSkipPrompt(text) {
    if (!text) return true;
    const t = text.trim();
    if (!t) return true;
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

// ─── 最終チェック用カウンター ───
const totalDataRows = rows.length - 1; // ヘッダー除く
const warnings = [];
let skippedSUYA = 0;
let emptyD = 0;
let emptyH = 0;
let emptyI = 0;

for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < 2) continue;

    const cutNo = (row[0] || '').trim();
    const section = (row[1] || '').trim();
    const narr = (row[3] || '').trim();
    const nb1 = (row[7] || '').trim();
    const nb2 = (row[8] || '').trim();

    // カット番号が空なら非データ行として無視
    if (!cutNo) continue;

    // ─── 抜け漏れチェック ───
    if (!narr) { emptyD++; warnings.push(`⚠ カット${cutNo}: D列（ナレーション）が空`); }
    if (!nb1) { emptyH++; warnings.push(`⚠ カット${cutNo}: H列（パターン1）が空`); }
    if (!nb2) { emptyI++; warnings.push(`⚠ カット${cutNo}: I列（パターン2）が空`); }

    // 両方ともスキップ対象なら飛ばす
    if (isSkipPrompt(nb1) && isSkipPrompt(nb2)) {
        skippedSUYA++;
        continue;
    }

    count++;
    out += `【カット${cutNo}】${section}\n`;
    out += `${narr.replace(/\*\*/g, '')}\n\n`;

    if (!isSkipPrompt(nb1)) {
        out += `▼ パターン1\n${nb1}\n\n`;
    }
    if (!isSkipPrompt(nb2)) {
        out += `▼ パターン2\n${nb2}\n\n`;
    }
    out += `---\n\n`;
}

fs.writeFileSync(outputFile, out, 'utf-8');

// ─── 最終レポート ───
console.log(`✅ 完了！ ${count} カット → ${outputFile}`);
console.log(`   📊 全${totalDataRows}行 → プロンプトあり: ${count} / SUYA等スキップ: ${skippedSUYA}`);

if (warnings.length > 0) {
    console.log(`\n⚠ 抜け漏れ検出 (${warnings.length}件):`);
    warnings.forEach(w => console.log(`   ${w}`));
    console.log(`\n   D列空: ${emptyD} / H列空: ${emptyH} / I列空: ${emptyI}`);
} else {
    console.log(`   ✅ D列・H列・I列の抜け漏れなし`);
}
