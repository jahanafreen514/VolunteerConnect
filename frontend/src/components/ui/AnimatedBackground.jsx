import React from 'react';
import RisingParticles from './RisingParticles';

const AnimatedBackground = ({ showParticles = true, showGrid = true }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Base Calm Pastel Atmospheric Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #FFF8EF 0%, #F5F1FA 45%, #EEF7F3 100%)'
        }}
      />

      {/* 2. Soft, slow-moving ambient blurred pastel blobs */}
      <div 
        className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full blur-[140px] animate-blob-slow pointer-events-none"
        style={{ backgroundColor: 'rgba(221, 213, 243, 0.32)' }} // Pale lavender
      />
      
      <div 
        className="absolute top-1/4 -right-24 w-[550px] h-[550px] rounded-full blur-[140px] animate-blob-slow pointer-events-none"
        style={{ backgroundColor: 'rgba(216, 238, 229, 0.32)', animationDelay: '6s' }} // Mint
      />

      <div 
        className="absolute -bottom-24 left-1/4 w-[520px] h-[520px] rounded-full blur-[130px] animate-blob-slow pointer-events-none"
        style={{ backgroundColor: 'rgba(246, 216, 197, 0.26)', animationDelay: '12s' }} // Soft peach
      />

      <div 
        className="absolute top-2/3 -left-16 w-[480px] h-[480px] rounded-full blur-[130px] animate-blob-slow pointer-events-none"
        style={{ backgroundColor: 'rgba(201, 221, 242, 0.28)', animationDelay: '18s' }} // Powder blue
      />

      {/* 3. Tiny floating pastel dots (Requirement 5) */}
      {showParticles && (
        <RisingParticles count={36} speed={0.35} />
      )}

      {/* 4. Very subtle, clean micro-dot texture */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
        />
      )}
    </div>
  );
};

export default AnimatedBackground;
