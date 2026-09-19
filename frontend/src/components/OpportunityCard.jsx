import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from './ui/Button';
import Badge from './ui/Badge';

const categoryColors = {
  Environment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Education: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Health: 'bg-red-500/20 text-red-400 border-red-500/30',
  Community: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Animals: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Default: 'bg-primary-500/20 text-primary-400 border-primary-500/30'
};

const OpportunityCard = ({ opportunity, onApply, showNGOActions = false }) => {
  const { title, ngo, location, date, category, skills, registeredCount, capacity, image } = opportunity;
  const isFull = registeredCount >= capacity;
  const progress = Math.min((registeredCount / capacity) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:bg-white/8 hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
    >
      <div className="h-48 w-full relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-600/30 to-purple-600/30 flex items-center justify-center">
            <span className="text-white/50 font-semibold">{category || 'Opportunity'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        {category && (
          <div className="absolute top-4 left-4">
            <Badge className={categoryColors[category] || categoryColors.Default}>{category}</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-400">{ngo?.name || 'Unknown NGO'}</span>
          {ngo?.isVerified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mb-4 text-sm text-gray-400 flex-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{location?.city}, {location?.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{date ? format(new Date(date), 'MMM d, yyyy') : 'TBA'}</span>
          </div>
        </div>

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.slice(0, 2).map((skill, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                {skill}
              </span>
            ))}
            {skills.length > 2 && (
              <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                +{skills.length - 2} more
              </span>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{registeredCount} / {capacity} volunteers</span>
            <span>{isFull ? 'Full' : `${capacity - registeredCount} spots left`}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          {showNGOActions ? (
            <Button variant="outline" className="w-full" onClick={() => onApply?.(opportunity._id)}>
              Manage
            </Button>
          ) : (
            <Button 
              variant={isFull ? 'secondary' : 'primary'} 
              className="w-full" 
              disabled={isFull}
              onClick={() => onApply?.(opportunity)}
            >
              {isFull ? 'Filled' : 'View Details'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityCard;
