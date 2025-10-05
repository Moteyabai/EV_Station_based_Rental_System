import re

# Đọc file
file_path = r'FE\FE-EVRental\src\styles\Staff.css'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Thay thế màu
content = content.replace('#667eea', '#66c9a9')
content = content.replace('#764ba2', '#56ab91')
content = content.replace('#1e3c72', '#56ab91')
content = content.replace('#2a5298', '#66c9a9')
content = content.replace('rgba(102, 126, 234', 'rgba(102, 201, 169')

# Ghi lại file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Đã thay đổi màu thành công!")
print("Tím/Xanh dương → Xanh lá cây nhạt")
