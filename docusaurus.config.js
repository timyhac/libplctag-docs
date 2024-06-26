// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'libplctag',
  tagline: 'Provides a portable and simple API for accessing Allen-Bradley and Modbus PLC data over Ethernet. ',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://timyhac.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/libplctag-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'libplctag', // Usually your GitHub org/user name.
  projectName: 'libplctag', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/timyhac/libplctag-docs/blob/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/timyhac/libplctag-docs/blob/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'libplctag',
        logo: {
          alt: 'libplctag Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'dropdown',
            label: 'Code',
            position: 'left',
            items: [
              {
                label: 'Github organization',
                href: 'https://github.com/libplctag',
              },
              {
                label: 'Releases',
                href: 'https://github.com/libplctag/libplctag/releases',
              },
              {
                label: 'Examples',
                href: 'https://github.com/libplctag/libplctag/tree/release/src/examples',
              },
              // ... more items
            ],
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/libplctag',
            label: 'GitHub',
            position: 'right',
          },
          
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/libplctag',
              },
              {
                label: 'Google Groups',
                href: 'https://groups.google.com/forum/#!forum/libplctag',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/libplctag/libplctag',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} libplctag. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
