import { DEMOS } from "../lib/demos";
import fs from "fs";

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

let sql = "-- Demos seed SQL - 13 demo personas with REAL content from lib/demos.ts\n";
sql += "-- Generated from lib/demos.ts - NO invented data\n\n";

for (const demo of DEMOS) {
  sql += `INSERT INTO demos (slug, tag, name, text, "group", business, blurb, welcome, published)\n`;
  sql += `VALUES (\n`;
  sql += `  '${escapeSql(demo.slug)}',\n`;
  sql += `  '${escapeSql(demo.tag)}',\n`;
  sql += `  '${escapeSql(demo.name)}',\n`;
  sql += `  '${escapeSql(demo.text)}',\n`;
  sql += `  '${escapeSql(demo.group)}',\n`;
  sql += `  '${escapeSql(demo.business)}',\n`;
  sql += `  '${escapeSql(demo.blurb)}',\n`;
  sql += `  '${escapeSql(demo.welcome)}',\n`;
  sql += `  TRUE\n`;
  sql += `)\n`;
  sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  tag = EXCLUDED.tag,\n`;
  sql += `  name = EXCLUDED.name,\n`;
  sql += `  text = EXCLUDED.text,\n`;
  sql += `  "group" = EXCLUDED."group",\n`;
  sql += `  business = EXCLUDED.business,\n`;
  sql += `  blurb = EXCLUDED.blurb,\n`;
  sql += `  welcome = EXCLUDED.welcome,\n`;
  sql += `  published = TRUE;\n\n`;
}

fs.writeFileSync("supabase/demos-seed.sql", sql);
console.log(`Generated seed for ${DEMOS.length} demos`);
