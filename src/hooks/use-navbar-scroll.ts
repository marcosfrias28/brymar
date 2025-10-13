import { useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';

export const useNavbarScroll = () => {
    const { scrollY } = useScroll();
    const [isVisible, setIsVisible] = useState<boolean>(true);

    useEffect(() => {
        const handleScroll = () => {
            const prev = scrollY.getPrevious();
            const curr = scrollY.get();
            setIsVisible(prev! > curr);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrollY]);

    return isVisible;
};
