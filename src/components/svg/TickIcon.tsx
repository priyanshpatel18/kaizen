interface TickIconProps {
  color?: string;
  className?: string;
}

export default function TickIcon({ color = "#292D32", className = "" }: TickIconProps) {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3.57994 7.58001C3.37994 7.58001 3.18994 7.50001 3.04994 7.36001L0.219941 4.53001C-0.0700586 4.24001 -0.0700586 3.76001 0.219941 3.47001C0.509941 3.18001 0.989941 3.18001 1.27994 3.47001L3.57994 5.77001L8.71994 0.630006C9.00994 0.340006 9.48994 0.340006 9.77994 0.630006C10.0699 0.920006 10.0699 1.40001 9.77994 1.69001L4.10994 7.36001C3.96994 7.50001 3.77994 7.58001 3.57994 7.58001Z"
        fill={color}
      />
    </svg>
  );
}
