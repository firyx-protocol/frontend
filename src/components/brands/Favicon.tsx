import { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
    size?: "sm" | "md" | "lg";
};

const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
};

export const Favicon = ({ size = "md", ...props }: Props) => {
    const dimensions = sizeMap[size];
    
    return (
        <svg 
            width={dimensions} 
            height={dimensions} 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect y="7.62939e-06" width="128" height="336" rx="64" fill="currentColor" />
            <rect x="512" y="1.52588e-05" width="128" height="312" rx="64" transform="rotate(90 512 1.52588e-05)" fill="currentColor" />
            <rect x="512" y="512" width="512" height="128" rx="64" transform="rotate(-180 512 512)" fill="currentColor" />
            <rect x="336" y="160" width="192" height="128" rx="64" transform="rotate(90 336 160)" fill="currentColor" />
            <rect x="512" y="160" width="192" height="128" rx="64" transform="rotate(90 512 160)" fill="currentColor" />
        </svg>
    )
}