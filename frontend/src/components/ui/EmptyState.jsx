import React from 'react';
import { Package } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const EmptyState = ({ icon: Icon = Package, title, description, message, action }) => {
  const desc = description || message;

  const renderIcon = () => {
    if (!Icon) return <Package className="w-8 h-8 text-[#556e5a]" />;
    
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Component = Icon;
      return <Component className="w-8 h-8 text-[#556e5a]" />;
    }

    return <Package className="w-8 h-8 text-[#556e5a]" />;
  };

  return (
    <Card className="flex flex-col items-center justify-center p-8 sm:p-12 text-center w-full max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#D8EEE5] border border-[#bce1d3] flex items-center justify-center mb-5 shadow-soft-sm">
        {renderIcon()}
      </div>
      {title && <h3 className="text-lg sm:text-xl font-bold text-[#26372B] mb-2">{title}</h3>}
      {desc && (
        <p className="text-xs sm:text-sm text-[#667085] max-w-sm mb-6 leading-relaxed">{desc}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick} href={action.href}>
          {action.label}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
