import { cn } from '@/lib/utils';

// Circular text component for property features
interface CircularTextProps {
  text: string;
  className?: string;
}

export function CircularText({ text, className }: CircularTextProps) {
  const letters = text.split('');
  
  return (
    <div className={cn("relative w-44 h-44", className)}>
      <svg className="w-full h-full animate-spin" style={{ animationDuration: '20s' }}>
        <defs>
          <path
            id="circle"
            d="M 88,88 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
          />
        </defs>
        <text className="fill-white font-poppins text-lg font-light">
          <textPath href="#circle">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="74" height="74" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M38.1109 0.666626L44.4804 31.5194L75.3331 37.8888L44.4804 44.2583L38.1109 75.1111L31.7414 44.2583L0.888672 37.8888L31.7414 31.5194L38.1109 0.666626Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
