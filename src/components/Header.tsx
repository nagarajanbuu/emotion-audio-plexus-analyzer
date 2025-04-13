
import { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'py-3 glass-effect subtle-shadow border-b' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Smile className="h-8 w-8 text-primary animate-fade-in" />
          <h1 className="text-xl font-medium tracking-tight animate-slide-up">
            Emotion Recognition
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
