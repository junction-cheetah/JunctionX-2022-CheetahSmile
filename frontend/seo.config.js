export default {
  titleTemplate: '%s | Junction Asia 2022',
  openGraph: {
    type: 'website',
    site_name: 'cheetah',
    images: [
      {
        url: 'https://junction-x-2022-cheetah-smile.vercel.app/vegimap-512x512.png',
      },
    ],
  },
  additionalLinkTags: [
    {
      rel: 'shortcut icon',
      href: '/favicon.ico',
    },
    {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://cdn.jsdelivr.net/gh/loplat/NanumSquareRound@main/nanumsquareround.css',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    // iOS
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/icons/vegimap-180x180.png',
    },
  ],
  additionalMetaTags: [
    {
      name: 'description',
      content: 'Junction Asia 2022 AWS GameTech',
    },
    {
      name: 'application-name',
      content: 'cheetah',
    },
    // iOS
    {
      name: 'apple-mobile-web-app-title',
      content: 'cheetah',
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
      content: '#226AF6',
    },
  ],
};
