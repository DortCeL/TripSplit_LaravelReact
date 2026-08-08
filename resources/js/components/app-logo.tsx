export default function AppLogo() {
    return (
      <>
        {/* Icon container – transparent background, bigger */}
        <div className="flex aspect-square size-12 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            fill="none"
            className="size-8" // bigger SVG
          >
            {/* Map pin body */}
            <path
              d="M20 6C14.477 6 10 10.477 10 16c0 5.523 10 16 10 16s10-10.477 10-16c0-5.523-4.477-10-10-10z"
              fill="currentColor" // use currentColor to inherit text color
              className="text-blue-600 dark:text-blue-400" // or your brand color
            />
            {/* Pin inner circle */}
            <circle cx="20" cy="16" r="4" fill="white" />
            {/* Dollar split – lines and shapes */}
            <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M16 9 L16 23" />
              <path d="M13 11 C13 8 19 8 19 11 C19 13 16 13 16 14 C16 15 19 15 19 17 C19 20 13 20 13 17" />
              <path d="M24 9 L24 23" />
              <path d="M21 11 C21 8 27 8 27 11 C27 13 24 13 24 14 C24 15 27 15 27 17 C27 20 21 20 21 17" />
            </g>
            <line x1="8" y1="24" x2="32" y2="24" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
            <polygon points="6,26 8,24 10,26" fill="white" />
            <polygon points="30,26 32,24 34,26" fill="white" />
          </svg>
        </div>
  
        {/* Text – slightly larger */}
        <div className="ml-2 grid flex-1 text-left text-base">
          <span className="mb-0.5 truncate leading-none font-semibold text-gray-900 dark:text-white">
            TripSplit
          </span>
        </div>
      </>
    );
  }