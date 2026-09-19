import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Search, Heart, Shield, MapPin, Award, BarChart3, ArrowDown } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import OpportunityCard from '../components/ui/OpportunityCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import { opportunityService } from '../services/opportunityService';

const Home = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOpportunities, setTotalOpportunities] = useState(0);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await opportunityService.getOpportunities({ status: 'published', limit: 6 });
        setOpportunities(response.data.opportunities || []);
        setTotalOpportunities(response.data.totalDocs || response.data.total || 0);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 text-white pt-16">
        <AnimatedBackground />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              Make an Impact.
            </span>
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-4xl font-semibold mb-6"
          >
            Volunteer. Connect. Change Lives.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Join thousands of volunteers and verified NGOs creating real change in communities worldwide.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/opportunities" className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-all w-full sm:w-auto text-center">
              Browse Opportunities
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-lg font-medium transition-all w-full sm:w-auto text-center">
              Join as Volunteer
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce"
        >
          <ArrowDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Stats Section */}
      {!loading && totalOpportunities > 0 && (
        <section className="py-12 bg-gray-900 border-y border-gray-800">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-2">
              <span className="text-primary-400">{totalOpportunities}</span> Opportunities Available
            </h3>
            <p className="text-gray-400">Join our growing community and start contributing today.</p>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Your journey to making a difference starts here. Simple steps to connect with causes you care about.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
          >
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 -z-10"></div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary-900/50 border border-primary-500/30 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                <User className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Your Profile</h3>
              <p className="text-gray-400">Sign up and tell us about your skills and interests to find the best matches.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-accent-900/50 border border-accent-500/30 flex items-center justify-center mb-6 shadow-lg shadow-accent-500/20">
                <Search className="w-10 h-10 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Discover Opportunities</h3>
              <p className="text-gray-400">Browse verified NGO opportunities filtered by your specific interests and location.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-green-900/50 border border-green-500/30 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <Heart className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Make an Impact</h3>
              <p className="text-gray-400">Participate in events, track your progress, and earn certificates for your time.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Current Opportunities</h2>
              <p className="text-gray-400">Real opportunities from verified NGOs</p>
            </div>
            <Link to="/opportunities" className="mt-4 md:mt-0 text-primary-400 hover:text-primary-300 font-medium inline-flex items-center group">
              View All Opportunities 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : opportunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map(opp => (
                <OpportunityCard key={opp._id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<Search className="w-12 h-12" />}
              title="No opportunities found"
              message="No opportunities yet — check back soon!"
            />
          )}
        </div>
      </section>

      {/* Why VolunteerConnect */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why VolunteerConnect?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We provide a secure, rewarding platform for both volunteers and organizations.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-blue-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Verified NGOs</h3>
              <p className="text-gray-400 text-sm">All organizations are admin-verified before listing opportunities ensuring safety.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mb-4 text-green-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Local & Remote</h3>
              <p className="text-gray-400 text-sm">Find opportunities near you or participate remotely from anywhere in the world.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4 text-yellow-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn Certificates</h3>
              <p className="text-gray-400 text-sm">Get recognized for your contributions with digital certificates for completed tasks.</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-pink-500/20 flex items-center justify-center mb-4 text-primary-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Impact</h3>
              <p className="text-gray-400 text-sm">Monitor your volunteer hours and participation history through our dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-accent-900 opacity-90"></div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to make a difference?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Join our community today and start contributing to causes that matter to you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-all w-full sm:w-auto text-center shadow-xl">
              Join as Volunteer
            </Link>
            <Link to="/register?role=ngo" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-lg font-medium transition-all w-full sm:w-auto text-center">
              Register Your NGO
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
