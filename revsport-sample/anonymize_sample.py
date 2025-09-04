#!/usr/bin/env python3
"""
Script to anonymize the revsport sample HTML file by replacing all personal information
with made-up names while preserving the structure and functionality.

This script creates copies of the input files and works on the copies, leaving originals untouched.
"""

import re
import os
import shutil

def anonymize_html_file(input_file, output_file=None):
    """
    Anonymize the HTML file by replacing real names with made-up ones.
    
    Args:
        input_file: Path to the input HTML file
        output_file: Path to output file (if None, overwrites input file)
    """
    
    # Generate a large pool of realistic fake names
    first_names = [
        "Alex", "Sarah", "Mike", "Emma", "David", "Lisa", "James", "Maya",
        "Ryan", "Sophie", "Kevin", "Rachel", "Daniel", "Amanda", "Chris", "Jessica",
        "Michael", "Ashley", "Brandon", "Samantha", "Tyler", "Nicole", "Jordan", "Lauren",
        "Matthew", "Megan", "Andrew", "Kelly", "Joshua", "Jennifer", "Anthony", "Stephanie",
        "Christopher", "Michelle", "Jonathan", "Amy", "Robert", "Angela", "Jason", "Elizabeth",
        "Nicholas", "Kimberly", "William", "Rebecca", "Steven", "Katherine", "Brian", "Hannah",
        "Aaron", "Melissa", "Nathan", "Christina", "Ryan", "Patricia", "Adam", "Laura",
        "Eric", "Maria", "Mark", "Julie", "Paul", "Linda", "Charles", "Carol",
        "Thomas", "Nancy", "Scott", "Sharon", "Kevin", "Helen", "Richard", "Sandra",
        "Jacob", "Betty", "Peter", "Dorothy", "Benjamin", "Lisa", "Henry", "Karen",
        "Carlos", "Anna", "Diego", "Diana", "Luis", "Sofia", "Marco", "Grace",
        "Antonio", "Victoria", "Miguel", "Olivia", "Jose", "Chloe", "Francisco", "Zoe"
    ]
    
    last_names = [
        "Johnson", "Wilson", "Chen", "Rodriguez", "Kim", "Thompson", "Anderson", "Patel",
        "O'Connor", "Martinez", "Zhang", "Brown", "Lee", "Taylor", "Garcia", "White",
        "Torres", "Davis", "Miller", "Jones", "Smith", "Williams", "Moore", "Jackson",
        "Martin", "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "King",
        "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez",
        "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell",
        "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers",
        "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper",
        "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
        "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood",
        "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long"
    ]
    
    # Generate unique fake names
    import random
    random.seed(42)  # For consistent results across runs
    
    fake_names = []
    used_combinations = set()
    
    # Generate enough names (we need at least 100 to be safe)
    for _ in range(200):  # Generate plenty of names
        first = random.choice(first_names)
        last = random.choice(last_names)
        full_name = f"{first} {last}"
        
        if full_name not in used_combinations:
            fake_names.append(full_name)
            used_combinations.add(full_name)
    
    # Read the file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 1: Replace team name references
    content = re.sub(r'CYSM Sea Dragons', 'Blue River Sharks', content)
    content = re.sub(r'CYSM%20Sea%20Dragons', 'Blue%20River%20Sharks', content)
    
    # Step 2: Replace organization references  
    content = re.sub(r'/cysm/', '/sampleclub/', content)
    
    # Step 3: Find all member names in the HTML and replace them
    # Pattern 1: Names in eligibleMemberName links
    member_name_pattern = r'<a class="fw-bold eligibleMemberName"[^>]*>([^<]+)</a>'
    matches = re.findall(member_name_pattern, content)
    
    # Create a mapping of real names to fake names
    name_mapping = {}
    fake_name_index = 0
    
    for match in matches:
        # Skip names that are already fake or malformed
        if match not in name_mapping and match not in ['>Member Name', 'Member Name']:
            if fake_name_index < len(fake_names):
                name_mapping[match] = fake_names[fake_name_index]
                fake_name_index += 1
            else:
                # If we somehow run out of names (shouldn't happen with 200), generate more
                extra_first = random.choice(first_names)
                extra_last = random.choice(last_names)
                name_mapping[match] = f"{extra_first} {extra_last}"
    
    # Pattern 2: Names in data-member_name attributes
    data_name_pattern = r'data-member_name="([^"]+)"'
    data_matches = re.findall(data_name_pattern, content)
    
    for match in data_matches:
        if match not in name_mapping and match != 'Anonymous Member':
            if fake_name_index < len(fake_names):
                name_mapping[match] = fake_names[fake_name_index]
                fake_name_index += 1
            else:
                # If we somehow run out of names, generate more
                extra_first = random.choice(first_names)
                extra_last = random.choice(last_names)
                name_mapping[match] = f"{extra_first} {extra_last}"
    
    # Apply all the replacements
    for real_name, fake_name in name_mapping.items():
        # Replace in visible text
        content = content.replace(f'>{real_name}<', f'>{fake_name}<')
        # Replace in data attributes
        content = content.replace(f'data-member_name="{real_name}"', f'data-member_name="{fake_name}"')
    
    # Step 5: Clean up any remaining generic placeholders and JavaScript templates
    content = re.sub(r'>Member Name<', '>Alex Johnson<', content)
    content = re.sub(r'data-member_name="Anonymous Member"', 'data-member_name="Alex Johnson"', content)
    
    # Replace hardcoded names in JavaScript templates (these use placeholder variables like {id}, {link})
    content = re.sub(r'>Jonathan Henderson<', '>{memberName}<', content)
    content = re.sub(r'data-member_name="Jonathan Henderson"', 'data-member_name="{memberName}"', content)
    
    # Step 6: Anonymize member IDs and URLs
    # Find all member IDs and create a mapping
    member_id_pattern = r'data-member_id="(\d+)"'
    member_ids = re.findall(member_id_pattern, content)
    
    # Create sequential fake IDs starting from 1001
    member_id_mapping = {}
    fake_id_counter = 1001
    
    for member_id in set(member_ids):  # Use set to avoid duplicates
        member_id_mapping[member_id] = str(fake_id_counter)
        fake_id_counter += 1
    
    # Replace member IDs in data attributes and URLs
    for real_id, fake_id in member_id_mapping.items():
        # Replace in data-member_id attributes
        content = content.replace(f'data-member_id="{real_id}"', f'data-member_id="{fake_id}"')
        # Replace in URLs
        content = content.replace(f'/members/{real_id}', f'/members/{fake_id}')
        # Replace in element IDs
        content = content.replace(f'id="eligibleMember_{real_id}"', f'id="eligibleMember_{fake_id}"')
    
    print(f"Anonymized {len(member_id_mapping)} member IDs:")
    for real_id, fake_id in member_id_mapping.items():
        print(f"  {real_id} -> {fake_id}")
    
    # Step 7: Update file references to match new team name
    content = re.sub(
        r'Edit%20crew%20-%20CYSM%20Sea%20Dragons%20-%20revolutioniseSPORT_files',
        'Edit%20crew%20-%20Blue%20River%20Sharks%20-%20revolutioniseSPORT_files',
        content
    )
    
    # Write the result
    output_path = output_file if output_file else input_file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Anonymized HTML file written to: {output_path}")
    print(f"Replaced {len(name_mapping)} unique names:")
    for real_name, fake_name in name_mapping.items():
        print(f"  '{real_name}' -> '{fake_name}'")

def main():
    """Main function to run the anonymization."""
    
    # File paths
    original_sample_dir = "revsport-sample"
    anonymized_sample_dir = "revsport-sample-anonymized"
    
    original_html = os.path.join(original_sample_dir, "Edit crew - CYSM Sea Dragons - revolutioniseSPORT.html")
    original_files_dir = os.path.join(original_sample_dir, "Edit crew - CYSM Sea Dragons - revolutioniseSPORT_files")
    
    anonymized_html = os.path.join(anonymized_sample_dir, "Edit crew - Blue River Sharks - revolutioniseSPORT.html")
    anonymized_files_dir = os.path.join(anonymized_sample_dir, "Edit crew - Blue River Sharks - revolutioniseSPORT_files")
    
    # Check if input file exists
    if not os.path.exists(original_html):
        print(f"Error: Could not find the original HTML file at: {original_html}")
        return
    
    # Create anonymized directory if it doesn't exist
    os.makedirs(anonymized_sample_dir, exist_ok=True)
    
    # Copy the HTML file
    print(f"Copying HTML file: {original_html} -> {anonymized_html}")
    shutil.copy2(original_html, anonymized_html)
    
    # Copy the files directory if it exists
    if os.path.exists(original_files_dir):
        if os.path.exists(anonymized_files_dir):
            shutil.rmtree(anonymized_files_dir)
        print(f"Copying files directory: {original_files_dir} -> {anonymized_files_dir}")
        shutil.copytree(original_files_dir, anonymized_files_dir)
    
    # Run anonymization on the copied file
    anonymize_html_file(anonymized_html)
    
    print(f"\nAnonymization complete!")
    print(f"Original files remain untouched in: {original_sample_dir}")
    print(f"Anonymized files created in: {anonymized_sample_dir}")

if __name__ == "__main__":
    main()