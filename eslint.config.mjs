import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

export default [
  { ignores: ['.next/**', '.claude/**', 'node_modules/**'] },
  ...coreWebVitals,
  ...typescript,
  {
    settings: {
      react: { version: '18' },
    },
  },
];
