
import { ReactNode } from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  onSettingsClick?: () => void;
  rightElement?: ReactNode;
}

const InputCard = ({ title, children, className, onSettingsClick, rightElement }: InputCardProps) => {
  return (
    <div className={cn(
      "bg-card rounded-lg border p-6 shadow-sm transition-all duration-300 hover:shadow-md",
      "animate-fade-in", 
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">{title}</h2>
        {rightElement ? (
          rightElement
        ) : (
          <button 
            onClick={onSettingsClick}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default InputCard;
