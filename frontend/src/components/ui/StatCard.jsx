import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

const colorStyles = {
  blue: 'bg-[#C9DDF2] text-[#24426b] border-[#b2d0ee]',
  purple: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]',
  green: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]',
  orange: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]',
  red: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]',
  cyan: 'bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb]',
};

const StatCard = ({ title, value, icon: Icon, change, color = 'green', delay = 0 }) => {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const changeColor = isPositive ? 'text-[#3d9670]' : isNegative ? 'text-[#be6b80]' : 'text-[#667085]';

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="p-5 hover:border-[#BFD8C2]/90">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-1.5">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#26372B]">{value}</h3>
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-xl border shrink-0 ${colorStyles[color] || colorStyles.green}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {change && (
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-semibold ${changeColor}`}>
              {change}
            </span>
            <span className="text-[#667085] ml-1.5">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StatCard;
