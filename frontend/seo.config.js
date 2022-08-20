export default {
  titleTemplate: '%s | Junction Asia 2022',
  openGraph: {
    type: 'website',
    site_name: 'co-building',
    images: [
      {
        url: 'https://cobuilding.vercel.app/co-building-512x512.png',
      },
    ],
  },
  additionalLinkTags: [
    {
      rel: 'shortcut icon',
      href: '/favicon.ico',
    },
    // 글꼴
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.cdnfonts.com/css/azo-sans',
    },
    {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css',
    },
    // manifest
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    // iOS
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/icons/co-building-180x180.png',
    },
  ],
  additionalMetaTags: [
    {
      httpEquiv: 'Content-Security-Policy',
      content: 'upgrade-insecure-requests',
    },
    {
      name: 'description',
      content: 'Junction Asia 2022 AWS GameTech',
    },
    {
      name: 'application-name',
      content: 'co-building',
    },
    // iOS
    {
      name: 'apple-mobile-web-app-title',
      content: 'co-building',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      name: 'format-detection',
      content: 'telephone:no',
    },
    // Android
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'theme-color',
      content: '#D5EAFA',
    },
  ],
};
