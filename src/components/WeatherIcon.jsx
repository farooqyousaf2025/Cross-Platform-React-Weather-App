const PATHS = {
  sun: [
    <circle key="c" cx="12" cy="12" r="4.5" />,
    ...[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1="12"
        y1="2.6"
        x2="12"
        y2="4.8"
        transform={`rotate(${deg} 12 12)`}
      />
    )),
  ],
  'cloud-sun': [
    <circle key="c" cx="9" cy="8.5" r="3.2" />,
    <line key="l1" x1="9" y1="2.4" x2="9" y2="3.8" />,
    <line key="l2" x1="3.9" y1="3.9" x2="4.9" y2="4.9" />,
    <line key="l3" x1="2.4" y1="8.5" x2="3.8" y2="8.5" />,
    <path key="p" d="M8.5 19h7.8a3.2 3.2 0 0 0 .3-6.4 4.4 4.4 0 0 0-8.3 1.1A2.7 2.7 0 0 0 8.5 19Z" />,
  ],
  cloud: [
    <path key="p" d="M6.8 19h10.6a3.9 3.9 0 0 0 .4-7.8 5.3 5.3 0 0 0-10.1 1.3A3.3 3.3 0 0 0 6.8 19Z" />,
  ],
  fog: [
    <path key="p" d="M6.8 14.5h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2 3 3 0 0 0-1.4 6Z" />,
    <line key="a" x1="4" y1="18.5" x2="20" y2="18.5" />,
    <line key="b" x1="7" y1="21.5" x2="17" y2="21.5" />,
  ],
  drizzle: [
    <path key="p" d="M6.8 15h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 6.8 15Z" />,
    <line key="a" x1="10" y1="18" x2="9.6" y2="19.8" />,
    <line key="b" x1="14" y1="18" x2="13.6" y2="19.8" />,
  ],
  rain: [
    <path key="p" d="M6.8 15h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 6.8 15Z" />,
    <line key="a" x1="9.5" y1="17.5" x2="8.7" y2="21" />,
    <line key="b" x1="13.5" y1="17.5" x2="12.7" y2="21" />,
    <line key="c" x1="17" y1="17.5" x2="16.3" y2="20" />,
  ],
  sleet: [
    <path key="p" d="M6.8 15h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 6.8 15Z" />,
    <line key="a" x1="9.5" y1="17.5" x2="8.7" y2="21" />,
    <line key="b" x1="14" y1="17.5" x2="14" y2="20.6" />,
    <line key="c" x1="12.6" y1="19" x2="15.4" y2="19" />,
  ],
  snow: [
    <path key="p" d="M6.8 15h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 6.8 15Z" />,
    <circle key="a" cx="9.5" cy="18.5" r="0.9" />,
    <circle key="b" cx="13.5" cy="20.5" r="0.9" />,
    <circle key="c" cx="17" cy="18.5" r="0.9" />,
  ],
  storm: [
    <path key="p" d="M6.8 14h10.6a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2A3 3 0 0 0 6.8 14Z" />,
    <path key="b" d="M13 15.5l-3 4h3l-1.6 4 5-5.6h-2.8l1.4-2.4Z" />,
  ],
};

export default function WeatherIcon({ icon, size = 24, className = '' }) {
  return (
    <svg
      className={`wx-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[icon] ?? PATHS.cloud}
    </svg>
  );
}
