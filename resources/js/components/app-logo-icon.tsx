import { SVGAttributes } from 'react';

/** TripSplit map-pin mark used across auth and chrome */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path
                d="M20 6C14.477 6 10 10.477 10 16c0 5.523 10 16 10 16s10-10.477 10-16c0-5.523-4.477-10-10-10z"
                fill="currentColor"
            />
            <circle cx="20" cy="16" r="4" fill="white" fillOpacity="0.95" />
        </svg>
    );
}
