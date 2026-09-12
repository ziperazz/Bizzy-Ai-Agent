// src/lib/fonts.ts
import localFont from 'next/font/local';

/**
 * AzarMehr — فونت فارسی (FD = Farsi Digits)
 * از نسخه Static و woff2 استفاده می‌کنیم (سبک‌تر و مطمئن‌تر)
 */
export const azarMehr = localFont({
  src: [
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/100-AzarMehr-FD-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/200-AzarMehr-FD-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/300-AzarMehr-FD-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/400-AzarMehr-FD-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/500-AzarMehr-FD-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/600-AzarMehr-FD-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AzarMehr/Static/woff2/900-AzarMehr-FD-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-azar-mehr',
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Tahoma',
    'Arial',
    'sans-serif',
  ],
  adjustFontFallback: 'Arial',
});

/**
 * Outfit — فونت انگلیسی (Static 9 weights)
 */
export const outfit = localFont({
  src: [
    { path: '../../public/fonts/Outfit-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../../public/fonts/Outfit-ExtraLight.ttf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/Outfit-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Outfit-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Outfit-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Outfit-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/Outfit-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Outfit-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../../public/fonts/Outfit-Black.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Arial', 'sans-serif'],
});