import re

with open('index-old.html', 'r', encoding='utf-8') as f:
    html = f.read()

match = re.search(r'<body>(.*?)<script type="module"', html, re.DOTALL)
if match:
    body_content = match.group(1)
    with open('src/app/app.component.html', 'w', encoding='utf-8') as f:
        f.write(body_content)
    print("Extracted successfully.")
else:
    print("Match not found.")
