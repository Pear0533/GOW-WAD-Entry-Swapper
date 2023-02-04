const fs = require('fs');
const WAD_FILE = fs.readFileSync(`./${process.argv[2]}`);
let TEMPLATE_FILE = fs.readFileSync(`./${process.argv[3]}`);
let TARGET_FILE = fs.readFileSync(`./${process.argv[4]}`);
let IS_TARGET_RAW_DDS = TARGET_FILE.slice(0, 3).toString() == "DDS";
const OUTPUT_FILENAME = `./${process.argv[5]}`;
const IS_PS4 = process.argv[6] == 1;
let TARGET_FILE_SIZE = TARGET_FILE.length;
const TEMPLATE_FILE_INDEX = WAD_FILE.indexOf(TEMPLATE_FILE);
const SIZE_INDEX = TEMPLATE_FILE_INDEX - 60;
const conv = num => [
    (num >> 24) & 255,
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
];

function setPadding(buf) {
    let padAmount = buf.length % 16;
    padAmount = padAmount != 0 ? 16 - padAmount : padAmount;
    return padAmount != 0 ? Buffer.concat([buf, Buffer.alloc(padAmount)]) : buf;
}

if (IS_TARGET_RAW_DDS) {
	let modifiedTexture = Buffer.concat([TEMPLATE_FILE.slice(0, 76), TARGET_FILE]);
	TARGET_FILE = modifiedTexture;
	TARGET_FILE_SIZE = TARGET_FILE.length;
}
TEMPLATE_FILE = setPadding(TEMPLATE_FILE);
TARGET_FILE = setPadding(TARGET_FILE);
let newSize = conv(TARGET_FILE_SIZE);
if (IS_PS4) newSize = newSize.reverse();
let modifiedWad = Buffer.concat([WAD_FILE.slice(0, SIZE_INDEX), Buffer.from(newSize), WAD_FILE.slice(SIZE_INDEX + 4, WAD_FILE.length)]);
modifiedWad = Buffer.concat([modifiedWad.slice(0, TEMPLATE_FILE_INDEX), TARGET_FILE, modifiedWad.slice(TEMPLATE_FILE_INDEX + TEMPLATE_FILE.length, modifiedWad.length)]);
fs.writeFileSync(OUTPUT_FILENAME, modifiedWad);