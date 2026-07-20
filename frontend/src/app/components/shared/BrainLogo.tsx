interface Props {
  size?: number;
  color?: string;
}
 
export function BrainLogo({ size = 32, color = "#7c6ff7" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill={color} fillOpacity="0.15" />
      <path
        d="M16 6C12.5 6 10 8.5 10 11.5C10 12.8 10.5 14 11.3 14.9C10.5 15.4 10 16.3 10 17.3C10 18.9 11.2 20.2 12.8 20.4C12.9 21.9 14.3 23 16 23C17.7 23 19.1 21.9 19.2 20.4C20.8 20.2 22 18.9 22 17.3C22 16.3 21.5 15.4 20.7 14.9C21.5 14 22 12.8 22 11.5C22 8.5 19.5 6 16 6Z"
        fill={color}
        fillOpacity="0.9"
      />
      <circle cx="13.5" cy="12" r="1.5" fill="white" fillOpacity="0.8" />
      <circle cx="18.5" cy="12" r="1.5" fill="white" fillOpacity="0.8" />
      <path
        d="M13 17C13 17 14 18.5 16 18.5C18 18.5 19 17 19 17"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
    </svg>
  );
}
 