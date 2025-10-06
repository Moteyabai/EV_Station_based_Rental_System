import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'src', 'styles', 'Staff.css');

// Đọc file
let content = readFileSync(filePath, 'utf8');

// Thay thế màu tím/xanh dương thành xanh lá cây nhạt
content = content.replace(/#667eea/g, '#66c9a9');
content = content.replace(/#764ba2/g, '#56ab91');
content = content.replace(/rgba\(102, 126, 234/g, 'rgba(102, 201, 169');

// Ghi lại file
writeFileSync(filePath, content, 'utf8');

console.log('✅ Đã thay đổi màu sắc thành công!');
console.log('   Tím (#667eea) → Xanh lá (#66c9a9)');
console.log('   Tím đậm (#764ba2) → Xanh lá đậm (#56ab91)');
