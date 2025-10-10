// Mock for lucide-react icons
import React from 'react';

// Create a generic mock icon component
const MockIcon = ({ className, ...props }) =>
    React.createElement('svg', {
        className,
        'data-testid': 'mock-icon',
        ...props
    });

// Export all the icons we use as the same mock component
export const AlertTriangle = MockIcon;
export const RefreshCw = MockIcon;
export const Save = MockIcon;
export const Home = MockIcon;
export const ArrowLeft = MockIcon;
export const Bug = MockIcon;
export const Wifi = MockIcon;
export const Shield = MockIcon;
export const HardDrive = MockIcon;
export const Check = MockIcon;
export const Circle = MockIcon;
export const AlertCircle = MockIcon;