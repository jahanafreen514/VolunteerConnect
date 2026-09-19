import React from 'react';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 relative">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow pt-24 pb-12 z-10">
        {children}
      </main>
      <div className="z-10">
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout;
