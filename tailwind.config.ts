import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { navy:"#063470", royal:"#0098C9", teal:"#28AFC2", violet:"#4B8FB5", canvas:"#F5F7FB" } } }, plugins: [] };
export default config;
