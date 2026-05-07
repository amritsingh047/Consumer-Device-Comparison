import csv
import json
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

laptops = []
seen_ids = set()

# Mapping for common brands to get better images if possible (placeholder for now)
# We can use Unsplash with keywords

with open('laptops.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        brand = row['Manufacturer'].strip()
        model = row['Model Name'].strip()
        if not brand or not model:
            continue
            
        full_name = f"{brand} {model}"
        device_id = slugify(full_name)
        
        if device_id in seen_ids:
            continue
        seen_ids.add(device_id)
        
        # Parse Price
        price_str = row['Price (Euros)'].replace(',', '.')
        try:
            price_eur = float(price_str)
            price_inr = int(price_eur * 90) # Rough conversion
        except:
            price_inr = 0
            
        # Category mapping for tags
        category = row['Category'].lower()
        tags = [category, "laptop", brand.lower()]
        if "gaming" in category:
            tags.append("gaming")
        if "ultrabook" in category:
            tags.append("premium")
            tags.append("thin-and-light")
            
        laptop = {
            "id": device_id,
            "name": full_name,
            "brand": brand,
            "category": "LAPTOP",
            "releaseDate": "2023-01-01",
            "tagline": f"{row['Category']} by {brand}",
            "imageUrl": f"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q={brand}+laptop",
            "thumbnailUrl": f"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q={brand}+laptop",
            "specs": {
                "display": {
                    "size": row['Screen Size'],
                    "resolution": row['Screen'],
                },
                "performance": {
                    "cpu": row['CPU'],
                    "ram": row['RAM'],
                    "storage": row[' Storage'],
                    "gpu": row['GPU']
                },
                "design": {
                    "weight": row['Weight']
                },
                "software": {
                    "os": f"{row['Operating System']} {row['Operating System Version']}".strip()
                }
            },
            "prices": [
                {
                    "id": f"p-{device_id}-amz",
                    "deviceId": device_id,
                    "vendor": "AMAZON",
                    "priceInr": price_inr,
                    "affiliateUrl": f"https://amazon.in/s?k={brand.replace(' ', '+')}+{model.replace(' ', '+')}",
                    "scrapedAt": "2024-05-06T00:00:00Z",
                    "inStock": True
                }
            ],
            "videos": [],
            "tags": tags
        }
        laptops.append(laptop)

# Take a subset if it's too many (e.g., 200) to keep the app snappy without a DB
# But the user asked to normalize and integrate, so let's provide a good chunk.
# Let's take the first 300 unique ones.
laptops = laptops[:300]

# Write to a TS file
with open('src/data/laptopDevices.ts', 'w', encoding='utf-8') as f:
    f.write("import { Device } from '../types/device';\n\n")
    f.write("export const laptopDevices: Device[] = ")
    f.write(json.dumps(laptops, indent=2))
    f.write(";\n")

print(f"Successfully processed {len(laptops)} laptops.")
