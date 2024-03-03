import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://new-paper.vercel.app",
  author: "Rhyn Ogg",
  desc: "Personal blog for my musings",
  title: "JABS",
  ogImage: "mstile-150x150.png",
  lightAndDarkMode: true,
  postPerPage: 4,
};

export const LOCALE = ["en-EN"];

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Dissurender/",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/rhyn-ogg/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:devrhyn@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://gitlab.com/rogg1",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
];
