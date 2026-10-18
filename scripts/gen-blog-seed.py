#!/usr/bin/env python3
"""Generate blog seed SQL from app/blog/posts.ts"""
import re
import json

with open("app/blog/posts.ts", "r") as f:
    content = f.read()

# Extract the posts array - find each post object
# This is a simplified parser for the specific format in posts.ts

posts = []
# Find all post objects by matching slug patterns
slug_pattern = r'slug:\s*"([^"]+)"'
slugs = re.findall(slug_pattern, content)
# First match is the interface, skip it
slugs = slugs[1:]  # Remove "slug: string" from interface

print(f"-- Found {len(slugs)} slugs: {slugs}")
print(f"-- Blog seed SQL - {len(slugs)} posts")
print()

# For each slug, extract the full post data
# We'll use a more robust approach - parse the TypeScript manually
for slug in slugs:
    # Find the post object containing this slug
    # Look for the pattern: { slug: "SLUG", ... } 
    # We'll extract title, excerpt, date, readTime, keywords, content
    
    # Find the start of this post (the { before slug:)
    slug_pos = content.find(f'slug: "{slug}"')
    if slug_pos == -1:
        print(f"-- WARNING: Could not find post with slug {slug}")
        continue
    
    # Find the opening { of this post object (go backwards)
    brace_count = 0
    post_start = slug_pos
    # Go back to find the { that starts this post
    for i in range(slug_pos, -1, -1):
        if content[i] == '}':
            brace_count += 1
        elif content[i] == '{':
            if brace_count == 0:
                post_start = i
                break
            brace_count -= 1
    
    # Now find the matching closing } 
    brace_count = 0
    post_end = post_start
    for i in range(post_start, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                post_end = i + 1
                break
    
    post_text = content[post_start:post_end]
    
    # Extract fields using regex
    title_match = re.search(r'title:\s*"([^"]+)"', post_text)
    excerpt_match = re.search(r'excerpt:\s*"([^"]+)"', post_text, re.DOTALL)
    date_match = re.search(r'date:\s*"([^"]+)"', post_text)
    readtime_match = re.search(r'readTime:\s*"([^"]+)"', post_text)
    
    title = title_match.group(1) if title_match else ""
    date = date_match.group(1) if date_match else "October 8, 2026"
    read_time = readtime_match.group(1) if readtime_match else "5 min read"
    
    # Excerpt might span multiple lines, handle it
    excerpt = ""
    if excerpt_match:
        excerpt = excerpt_match.group(1).replace('\n', ' ').replace('  ', ' ')
    
    # Keywords - extract array
    keywords_match = re.search(r'keywords:\s*\[(.*?)\]', post_text, re.DOTALL)
    keywords = []
    if keywords_match:
        kw_text = keywords_match.group(1)
        keywords = re.findall(r'"([^"]+)"', kw_text)
    
    # Content - this is complex, extract as JSON-like and convert
    # For now, we'll note that content needs manual handling
    # Actually, let's try to extract the content array
    
    print(f"-- Post: {slug}")
    print(f"-- Title: {title[:60]}...")

print()
print("-- NOTE: Full content extraction requires running via Node.js")
print("-- Use the TypeScript compiler to extract properly")
