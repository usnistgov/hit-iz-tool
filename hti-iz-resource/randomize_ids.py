import os
import sys
import json
import random

MAX_32BIT = 2_147_483_647

def get_all_json_files(directory):
    json_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.json'):
                json_files.append(os.path.join(root, file))
    return json_files

def generate_id_with_prefix(prefix):
    prefix_str = str(prefix)
    # Calculate maximum possible length
    max_length = len(str(MAX_32BIT))
    # Remaining length for random part
    random_len = max_length - len(prefix_str)
    if random_len <= 0:
        raise ValueError(f"Prefix '{prefix}' is too long for a 32-bit integer.")
    while True:
        # Generate random digits
        random_part = ''.join(str(random.randint(0, 9)) for _ in range(random_len))
        id_str = prefix_str + random_part
        new_id = int(id_str)
        if new_id <= MAX_32BIT:
            return new_id

def set_id_in_json(file_path, new_id):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if "id" in data:
            data["id"] = new_id
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {file_path} with id {new_id}")
        else:
            print(f"'id' not found in {file_path}, skipping.")
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <directory> [prefix]")
        sys.exit(1)
    directory = sys.argv[1]
    prefix = None
    if len(sys.argv) >= 3:
        try:
            prefix = int(sys.argv[2])
            if prefix < 1:
                raise ValueError
        except ValueError:
            print("Prefix must be a positive integer.")
            sys.exit(1)
    json_files = get_all_json_files(directory)
    used_ids = set()
    for file_path in json_files:
        if prefix is not None:
            while True:
                new_id = generate_id_with_prefix(prefix)
                if new_id not in used_ids:
                    used_ids.add(new_id)
                    break
        else:
            while True:
                new_id = random.randint(1, MAX_32BIT)
                if new_id not in used_ids:
                    used_ids.add(new_id)
                    break
        set_id_in_json(file_path, new_id)

if __name__ == "__main__":
    main()
