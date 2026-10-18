import next from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...next,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
