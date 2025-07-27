import React from 'react';

interface ElephantIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ElephantIcon: React.FC<ElephantIconProps> = ({ 
  width = 40, 
  height = 40, 
  className = "" 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse cx="20" cy="30" rx="12" ry="6" fill="#B4D8E7"/>
      <ellipse cx="12" cy="20" rx="8" ry="10" fill="#B4D8E7"/>
      <ellipse cx="28" cy="20" rx="8" ry="10" fill="#B4D8E7"/>
      <ellipse cx="20" cy="20" rx="10" ry="12" fill="#7EC4CF"/>
      <ellipse cx="15" cy="19" rx="1.5" ry="2" fill="#fff"/>
      <ellipse cx="25" cy="19" rx="1.5" ry="2" fill="#fff"/>
      <ellipse cx="15" cy="19" rx="0.7" ry="1" fill="#444"/>
      <ellipse cx="25" cy="19" rx="0.7" ry="1" fill="#444"/>
      <ellipse cx="20" cy="25" rx="2" ry="1" fill="#444"/>
      <path d="M20 28 Q21 32 24 32 Q27 32 26 28" stroke="#7EC4CF" strokeWidth="1.5" fill="none"/>
      <ellipse cx="8" cy="28" rx="2" ry="4" fill="#B4D8E7"/>
      <ellipse cx="32" cy="28" rx="2" ry="4" fill="#B4D8E7"/>
    </svg>
  );
};

export default ElephantIcon; 