import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  Globe, 
  BarChart, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Sliders, 
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const About = () => {
  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-gray-950 text-white">
        <AnimatedBackground />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              About VolunteerConnect
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
            >
              Building a World of <span className="gradient-text">Connected Impact</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              We bridge the gap between passionate volunteers and verified non-profits. Our mission is to transform civic engagement into a transparent, measurable, and deeply rewarding experience.
            </motion.p>
          </div>
        </section>

        {/* The Challenge & Solution */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/5 bg-gray-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 sm:p-10 border border-white/10 relative overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-5 border border-rose-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">The Challenge</h2>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Millions of people want to volunteer their skills but struggle to find trustworthy, verified community initiatives. Simultaneously, reputable NGOs spend valuable time managing scattered paperwork, attendance logs, and manual certificates instead of focusing on their core mission.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 sm:p-10 border border-primary-500/20 relative overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 w-fit mb-5 border border-primary-500/20">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Our Solution</h2>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  VolunteerConnect provides a centralized, secure ecosystem. NGOs undergo thorough administrative vetting, opportunities are matched with volunteers' specific skills, hours are digitally recorded, and tamper-proof digital certificates are issued automatically.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Verification & Trust Section */}
        <section id="verification" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-400">Security & Integrity</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Our Multi-Layer Verification Process
            </h2>
            <p className="text-gray-400 text-base mt-4 max-w-2xl mx-auto">
              Every NGO on VolunteerConnect must prove their legitimacy before they are permitted to post volunteer events.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Documentation Submission</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Organizations upload government registration, tax certificates, and official representative identification.
              </p>
            </div>

            <div className="glass-card p-6 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-secondary-500/15 text-secondary-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Administrative Review</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our administrative team inspects provided registration credentials against public non-profit databases.
              </p>
            </div>

            <div className="glass-card p-6 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 text-accent-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Verified Badge Issued</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Once approved, the NGO receives the verified badge and unlocks full opportunity creation capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits for Both Sides */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/30 border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Volunteers */}
            <div className="mb-20">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Value Proposition</span>
                <h2 className="text-3xl font-bold text-white mt-1">Why Volunteers Love VolunteerConnect</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 w-fit mb-4">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Verified Hour Tracking</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Every volunteer hour is marked through attendance check-ins and logged into your permanent civic service record.
                  </p>
                </div>
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-secondary-500/10 text-secondary-400 w-fit mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Official Certificates</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Download and share cryptographically serialized certificates proving your participation and leadership.
                  </p>
                </div>
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-accent-500/10 text-accent-400 w-fit mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Skill Advancement</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Gain hands-on experience in leadership, disaster relief, education, and technology that enhances your career.
                  </p>
                </div>
              </div>
            </div>

            {/* NGOs */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-400">For Organizations</span>
                <h2 className="text-3xl font-bold text-white mt-1">Empowering Non-Profits to Scale</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-secondary-500/10 text-secondary-400 w-fit mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Qualified Volunteers</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Review applicant profiles and specific skills to ensure the right team is assembled for every initiative.
                  </p>
                </div>
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 w-fit mb-4">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Automated Workflows</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    From publication to attendee check-in and certificate distribution, repetitive operations are handled seamlessly.
                  </p>
                </div>
                <div className="glass-card p-7 border border-white/10">
                  <div className="p-3 rounded-xl bg-accent-500/10 text-accent-400 w-fit mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Reputation & Trust</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Verified status signals trust to prospective donors, community partners, and volunteers worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center relative z-10 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Be Part of Something Bigger
            </h2>
            <p className="text-gray-400 text-base mb-8">
              Join thousands of changemakers who are building stronger, more resilient communities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium btn-glow transition-all">
                Start Volunteering
              </Link>
              <Link to="/register?role=ngo" className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium border border-white/15 transition-colors">
                Register as NGO
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default About;
