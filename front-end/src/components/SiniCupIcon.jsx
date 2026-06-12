function SiniCupIcon({ className = '', size = 24, color = 'currentColor', strokeWidth = 2, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 8h8a2 2 0 0 1 2 2v1.5a3.5 3.5 0 0 1-3.5 3.5h-5A3.5 3.5 0 0 1 5 11.5V10a2 2 0 0 1 2-2Z" />
      <path d="M15 8h1.5a2.5 2.5 0 0 1 0 5" />
      <path d="M8 16h6" />
      <path d="M10 6c.8-.7 1.8-1 2.8-1 1.1 0 2.1.3 3 .9" />
      <path d="M8.5 11.5c.3-.5.7-.8 1.1-.8" />
    </svg>
  )
}

export default SiniCupIcon
