import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "bot/**",
      "scripts/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "@next/next/no-location-assign-relative-destination": "warn",
    },
  },
];

export default eslintConfig;
