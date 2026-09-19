import React from 'react';
import { Package } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const EmptyState = ({ icon: Icon = Package, title, description, message, action }) => {
  const desc = description || message;

  const renderIcon = () => {
    if (!Icon) return <Package className="w-10 h-10 text-primary-400" />;
    
    // If Icon is already a JSX element (e.g. <Search className="w-12 h-12" />)
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    // If Icon is a React component (e.g. Package, Search, Calendar)
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const Component = Icon;
      return <Component className="w-10 h-10 text-primary-400" />;
    }

    return <Package className="w-10 h-10 text-primary-400" />;
  };

  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center w-full">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center mb-6 text-primary-400">
        {renderIcon()}
      </div>
      {title && <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>}
      {desc && (
        <p className="text-gray-400 max-w-md mb-8">{desc}</p>
      )}
      {action && (
        <Button onClick={action.onClick} href={action.href}>
          {action.label}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
