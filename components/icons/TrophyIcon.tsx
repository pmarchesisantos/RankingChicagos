import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    {...props}
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M16.5 18.75h-9a9.75 9.75 0 01-4.874-1.954.5.5 0 01.226-.885 18.7 18.7 0 0013.3-1.838.5.5 0 01.226.885 9.75 9.75 0 01-4.874 1.954z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 12.75v6m0 0h-3m3 0h3m-6-3.75V9a3 3 0 116 0v3.75m-6 0h6" 
    />
</svg>
);