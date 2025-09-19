import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Only hex/rgb colors for PDF compatibility
        primary: '#365486',
        secondary: '#f8fafc',
        accent: '#f8fafc',
        muted: '#f8fafc',
        destructive: '#e53935',
        border: '#ebebeb',
        input: '#ebebeb',
        ring: '#bdbdbd',
        background: '#ffffff',
        foreground: '#262626',
        card: '#ffffff',
        'card-foreground': '#262626',
        popover: '#ffffff',
        'popover-foreground': '#262626',
        'primary-foreground': '#fcfcfc',
        'secondary-foreground': '#365486',
        'muted-foreground': '#8b8c89',
        'accent-foreground': '#365486',
        'destructive-foreground': '#fff0f0',
        'chart-1': '#fbbf24',
        'chart-2': '#60a5fa',
        'chart-3': '#a78bfa',
        'chart-4': '#34d399',
        'chart-5': '#f87171',
        'chart-6': '#60a5fa',
        sidebar: '#fcfcfc',
        'sidebar-foreground': '#262626',
        'sidebar-primary': '#365486',
        'sidebar-primary-foreground': '#fcfcfc',
        'sidebar-accent': '#f8fafc',
        'sidebar-accent-foreground': '#365486',
        'sidebar-border': '#ebebeb',
        'sidebar-ring': '#bdbdbd',
      },
    },
  },
  plugins: [],
};

export default config;
