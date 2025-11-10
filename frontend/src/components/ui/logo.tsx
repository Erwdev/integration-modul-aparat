import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizes = {
    sm: {
      container: 'w-6 h-6',
      text: 'text-lg',
    },
    md: {
      container: 'w-8 h-8',
      text: 'text-xl',
    },
    lg: {
      container: 'w-10 h-10',
      text: 'text-2xl',
    },
  };

  return (
    <Link href="/" className={`flex items-center gap-2 group w-fit ${className}`}>
      <div className={`${sizes[size].container} bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 dark:group-hover:bg-indigo-600 transition-colors`}>
        <span className={`${sizes[size].text} font-bold text-white`}>S</span>
      </div>
      <div className={`${sizes[size].text} font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-500 transition-colors`}>
        SIAP
      </div>
    </Link>
  );
};

export default Logo;