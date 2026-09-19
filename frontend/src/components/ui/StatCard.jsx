import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const colorStyles = {
  blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
  purple: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  green: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  orange: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
  red: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30',
  cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
};

const iconColors = {
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-emerald-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  cyan: 'text-cyan-400',
};

const StatCard = ({ title, value, icon: Icon, change, color = 'blue', delay = 0 }) => {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const changeColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[color]} border`}>
              <Icon className={`w-6 h-6 ${iconColors[color]}`} />
            </div>
          )}
        </div>
        {change && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${changeColor}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StatCard;
