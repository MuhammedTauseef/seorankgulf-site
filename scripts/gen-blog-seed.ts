import { posts } from "../app/blog/posts";
import fs from "fs";

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

let sql = "-- Blog seed SQL - 11 posts with FULL original content\n";
sql += "-- Generated from app/blog/posts.ts\n\n";

for (const post of posts) {
  const contentJson = escapeSql(JSON.stringify(post.content));
  const keywordsArray = `ARRAY[${post.keywords.map(k => `'${escapeSql(k)}'`).join(", ")}]`;
  
  sql += `INSERT INTO blog_posts (slug, title, excerpt, content, keywords, published)\n`;
  sql += `VALUES (\n`;
  sql += `  '${escapeSql(post.slug)}',\n`;
  sql += `  '${escapeSql(post.title)}',\n`;
  sql += `  '${escapeSql(post.excerpt)}',\n`;
  sql += `  '${contentJson}'::jsonb,\n`;
  sql += `  ${keywordsArray}::text[],\n`;
  sql += `  TRUE\n`;
  sql += `)\n`;
  sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  title = EXCLUDED.title,\n`;
  sql += `  excerpt = EXCLUDED.excerpt,\n`;
  sql += `  content = EXCLUDED.content,\n`;
  sql += `  keywords = EXCLUDED.keywords,\n`;
  sql += `  published = TRUE;\n\n`;
}

fs.writeFileSync("supabase/blog-seed.sql", sql);
console.log(`Generated seed for ${posts.length} posts`);
