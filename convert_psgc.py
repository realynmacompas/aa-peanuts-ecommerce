import pandas as pd
import json

# Load the PSGC sheet
df = pd.read_excel("PSGC-July-2025-Publication-Datafile.xlsx", sheet_name="PSGC")

# Keep only needed columns
df = df[["Name", "Geographic Level"]]

# Build nested structure
result = {}
current_region = None
current_province = None
current_city = None

for _, row in df.iterrows():
    name = str(row["Name"]).strip()
    level = str(row["Geographic Level"]).strip()

    if level == "Reg":  # Region
        current_region = name
        result[current_region] = {}
        current_province = None
        current_city = None

    elif level == "Prov":  # Province
        current_province = name
        if current_region:
            result[current_region][current_province] = {}
        current_city = None

    elif level in ["Mun", "City"]:  # Municipality or City
        if current_province:  # Normal province case
            result[current_region][current_province][name] = []
        else:  # NCR or independent city (no province)
            result[current_region][name] = []
        current_city = name

    elif level == "Bgy":  # Barangay
        # Case 1: Region → Province → City → Barangay
        if current_region and current_province and current_city:
            result[current_region][current_province][current_city].append(name)

        # Case 2: Region → City → Barangay (NCR + Independent Cities)
        elif current_region and current_city:
            if isinstance(result[current_region][current_city], list):
                result[current_region][current_city].append(name)
            else:
                # Fix in case structure got mismatched
                result[current_region][current_city] = [name]

# Save as JSON
with open("psgc.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("✅ psgc.json created successfully!")
