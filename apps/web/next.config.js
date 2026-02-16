/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@matzon/shared-types', '@matzon/utils'],
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
};

module.exports = nextConfig;
EOFcat > apps/web/tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0A0D12', card: '#12171E', hover: '#1A2030' },
        accent: { DEFAULT: '#6C5CE7', hover: '#7C6CF7', cyan: '#00CEC9', blue: '#007AFF' },
        success: '#00B894',
        warning: '#FDCB6E',
        danger: '#FF3B30',
        border: { DEFAULT: 'rgba(255,255,255,0.08)', solid: '#2A3441' },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '22px',
      },
    },
  },
  plugins: [],
};

export default config;
