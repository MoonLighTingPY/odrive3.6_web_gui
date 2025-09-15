from bs4 import BeautifulSoup

# File mappings
files = [
    {"html": "odrive_api_references/odrive_reference05x.html", "json": "odriveApiReference05x.json", "label": "05x"},
    {"html": "odrive_api_references/odrive_reference06x.html", "json": "odriveApiReference06x.json", "label": "06x"}
]

for f in files:
    print(f"\nChecking ODrive {f['label']}...\n{'-'*40}")
    
    # Load HTML
    with open(f["html"], "r", encoding="utf-8") as html_file:
        soup = BeautifulSoup(html_file.read(), "html.parser")

    # Extract all property names
    properties = []
    for dl_attr in soup.find_all("dl", class_="py attribute"):
        dt = dl_attr.find("dt")
        if dt:
            name_tag = dt.select_one("span.descname > span.pre")
            if name_tag:
                properties.append(name_tag.text.strip())

    # Load JSON as text
    with open(f["json"], "r", encoding="utf-8") as json_file:
        json_text = json_file.read()

    # Find missing properties
    missing_props = [p for p in properties if p not in json_text]

    if missing_props:
        print(f"Missing properties in {f['label']}:")
        for p in missing_props:
            print("-", p)
    else:
        print(f"All properties found in {f['label']} JSON!")
