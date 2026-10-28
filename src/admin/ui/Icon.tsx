// Line icons for the CMS, drawn on a 20px grid with a 1.5px stroke.
const paths = {
  home: "M3.5 8.5 10 3.5l6.5 5V16a.5.5 0 0 1-.5.5h-3.5V12h-5v4.5H4a.5.5 0 0 1-.5-.5z",
  hero: "M3 4.5h14v11H3zM3 12l4-3.5 3.5 3L13 9.5l4 3.5M13 7.25h.01",
  person: "M10 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6M4 16.5c.6-3 3-4.5 6-4.5s5.4 1.5 6 4.5",
  briefcase: "M3 7h14v9H3zM7.5 7V4.5h5V7M3 11h14",
  star: "m10 3 2.1 4.4 4.9.6-3.6 3.4.9 4.8L10 13.9l-4.3 2.3.9-4.8L3 8l4.9-.6z",
  compass: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14M12.8 7.2l-1.4 4.2-4.2 1.4 1.4-4.2z",
  route: "M5 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M15 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M5 13.5V8a3 3 0 0 1 3-3h3M15 6.5V12a3 3 0 0 1-3 3H9",
  feather: "M15.5 4.5c-4-1-9 2-9.5 8l-1.5 3M6.5 12.5h5M8 9.5h5.5c1-2 1.5-3.5 2-5",
  mail: "M3 5h14v10H3zM3.5 5.5 10 11l6.5-5.5",
  footer: "M3 4h14v12H3zM3 12h14M6 14h3M11 14h3",
  list: "M7 5.5h10M7 10h10M7 14.5h10M3.5 5.5h.01M3.5 10h.01M3.5 14.5h.01",
  image: "M3 4h14v12H3zM3 13l4-4 3 3 2-2 5 5M12.75 7.5h.01",
  settings: "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M8.6 3h2.8l.4 2 1.6.9 1.9-.7 1.4 2.4-1.5 1.4v1.9l1.5 1.4-1.4 2.4-1.9-.7-1.6.9-.4 2H8.6l-.4-2-1.6-.9-1.9.7-1.4-2.4 1.5-1.4V9.2L3.3 7.8l1.4-2.4 1.9.7 1.6-.9z",
  globe: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14M3 10h14M10 3c2 2 2.8 4.3 2.8 7S12 15 10 17c-2-2-2.8-4.3-2.8-7S8 5 10 3",
  back: "M12 4.5 6.5 10l5.5 5.5",
  chevronRight: "M8 4.5l5.5 5.5L8 15.5",
  chevronDown: "M4.5 8l5.5 5.5L15.5 8",
  chevronUp: "M4.5 12.5 10 7l5.5 5.5",
  plus: "M10 4v12M4 10h12",
  trash: "M4 6h12M8 6V4h4v2M5.5 6l.7 10h7.6l.7-10M8.5 9v4.5M11.5 9v4.5",
  external: "M11 4h5v5M16 4l-7 7M14 11.5V16H4V6h4.5",
  check: "m4.5 10.5 3.5 3.5 7.5-8",
  alert: "M10 3 2.5 16.5h15zM10 8v4M10 14.25h.01",
  info: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14M10 9v5M10 6.25h.01",
  upload: "M10 13V3.5M6 7.5l4-4 4 4M4 13v3h12v-3",
  eye: "M2.5 10S5 4.5 10 4.5 17.5 10 17.5 10 15 15.5 10 15.5 2.5 10 2.5 10M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  desktop: "M3 4h14v9H3zM7 16.5h6M10 13v3.5",
  mobile: "M6.5 2.5h7v15h-7zM9.25 15h1.5",
  close: "M5 5l10 10M15 5 5 15",
  search: "M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M12.5 12.5 17 17",
  logout: "M8 4H4v12h4M12 6.5 15.5 10 12 13.5M15.5 10H8",
  menu: "M3.5 5.5h13M3.5 10h13M3.5 14.5h13",
  file: "M5 3h6.5L15 6.5V17H5zM11 3v4h4",
  link: "M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9",
  refresh: "M15.5 8A6 6 0 0 0 4.6 6.5M4.5 12a6 6 0 0 0 10.9 1.5M4.5 3.5v3h3M15.5 16.5v-3h-3",
  key: "M7 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M9.5 9.5H17M14.5 9.5V12M16.5 9.5V11.5",
  clock: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14M10 6v4l2.5 2",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
