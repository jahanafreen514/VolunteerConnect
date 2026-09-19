import React from 'react';
import { Package } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const EmptyState = ({ icon: Icon = Package, title, description, action }) => {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-md mb-8">{description}</p>
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
