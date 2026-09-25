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
import PolaroidCard from '../components/visual/PolaroidCard';
import FloatingCard from '../components/visual/FloatingCard';
import Floating from '../components/animations/Floating';
import FadeUp from '../components/animations/FadeUp';
import Parallax from '../components/animations/Parallax';

const About = () => {
  return (
    <PublicLayout>
      <div className="relative overflow-hidden text-slate-800 dark:text-slate-100 bg-transparent transition-colors duration-300">

        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto relative">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/25 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 shadow-sm"
            >
              <HeartHandshake className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <span>About VolunteerConnect</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white"
            >
              Building a World of <span className="gradient-text">Connected Impact</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              We bridge the gap between passionate volunteers and verified non-profits. Our mission is to transform civic engagement into a transparent, measurable, and deeply rewarding experience.
            </motion.p>

            {/* Floating Impact Showcase under Hero */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Floating distance={6} duration={5} delay={0.2}>
                <FloatingCard
                  icon={ShieldCheck}
                  iconColor="text-accent-600 bg-accent-50 dark:text-accent-300 dark:bg-accent-500/20 border-accent-200 dark:border-accent-500/30"
                  title="100% Vetted NGOs"
                  subtitle="Manual credential verification"
                  badge="Verified"
                />
              </Floating>

              <Floating distance={8} duration={6} delay={0.8}>
                <FloatingCard
                  icon={Award}
                  iconColor="text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30"
                  value="10,000+"
                  title="Certificates Issued"
                  subtitle="Verifiable and serialized"
                  badge="Serialized"
                />
              </Floating>
            </div>
          </div>
        </section>

        {/* The Challenge & Solution */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-200/70 dark:border-white/5 bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Challenge */}
              <FadeUp delay={0.1}>
                <div className="glass-card p-8 sm:p-10 border border-slate-200/80 dark:border-white/10 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit mb-5 border border-rose-200 dark:border-rose-500/20">
                      <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">The Challenge</h2>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                      Millions want to give back but encounter fragmented platforms, unverified groups, and scattered manual paperwork. Reputable non-profits spend excessive hours chasing attendance logs instead of fulfilling their social mission.
                    </p>
                  </div>
                  <div className="shrink-0 hidden sm:block">
                    <PolaroidCard
                      image="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80"
                      caption="Scattered coordination & food drives"
                      rotation={-3}
                      width="w-52"
                    />
                  </div>
                </div>
              </FadeUp>
              
              {/* Solution */}
              <FadeUp delay={0.25}>
                <div className="glass-card p-8 sm:p-10 border border-primary-200 dark:border-primary-500/20 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 w-fit mb-5 border border-primary-200 dark:border-primary-500/20">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Solution</h2>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                      VolunteerConnect provides a centralized, vetted civic network. Opportunities are matched with volunteer skills, hours are audited with digital check-ins, and tamper-proof digital certificates are awarded automatically.
                    </p>
                  </div>
                  <div className="shrink-0 hidden sm:block">
                    <PolaroidCard
                      image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=80"
                      caption="Vetted volunteers creating real impact"
                      rotation={3}
                      width="w-52"
                    />
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* Verification & Trust Section */}
        <section id="verification" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">Security & Integrity</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Our Multi-Layer Verification Process
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-base mt-4 max-w-2xl mx-auto">
              Every NGO on VolunteerConnect must prove their legitimacy before they are permitted to post volunteer events.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Parallax tiltMax={4}>
              <div className="glass-card p-6 border border-slate-200/80 dark:border-white/10 h-full">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold mb-4 border border-primary-200 dark:border-primary-500/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Documentation Submission</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Organizations upload government registration, tax certificates, and official representative identification.
                </p>
              </div>
            </Parallax>

            <Parallax tiltMax={4}>
              <div className="glass-card p-6 border border-slate-200/80 dark:border-white/10 h-full">
                <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-500/15 text-secondary-600 dark:text-secondary-400 flex items-center justify-center font-bold mb-4 border border-secondary-200 dark:border-secondary-500/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Administrative Review</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Our administrative team inspects provided registration credentials against public non-profit databases.
                </p>
              </div>
            </Parallax>

            <Parallax tiltMax={4}>
              <div className="glass-card p-6 border border-slate-200/80 dark:border-white/10 h-full">
                <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 flex items-center justify-center font-bold mb-4 border border-accent-200 dark:border-accent-500/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verified Badge Issued</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Once approved, the NGO receives the verified badge and unlocks full opportunity creation capabilities.
                </p>
              </div>
            </Parallax>
          </div>
        </section>

        {/* Benefits for Both Sides */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200/70 dark:border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Volunteers */}
            <div className="mb-10 sm:mb-12">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Value Proposition</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Why Volunteers Love VolunteerConnect</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 w-fit mb-4">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verified Hour Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Every volunteer hour is marked through attendance check-ins and logged into your permanent civic service record.
                  </p>
                </div>
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 w-fit mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Official Certificates</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Download and share cryptographically serialized certificates proving your participation and leadership.
                  </p>
                </div>
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 w-fit mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Skill Advancement</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Gain hands-on experience in leadership, disaster relief, education, and technology that enhances your career.
                  </p>
                </div>
              </div>
            </div>

            {/* NGOs */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary-600 dark:text-secondary-400">For Organizations</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Empowering Non-Profits to Scale</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 w-fit mb-4">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Qualified Volunteers</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Review applicant profiles and specific skills to ensure the right team is assembled for every initiative.
                  </p>
                </div>
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 w-fit mb-4">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Workflows</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    From publication to attendee check-in and certificate distribution, repetitive operations are handled seamlessly.
                  </p>
                </div>
                <div className="glass-card p-7 border border-slate-200/80 dark:border-white/10">
                  <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 w-fit mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reputation & Trust</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    Verified status signals trust to prospective donors, community partners, and volunteers worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center relative z-10 border-t border-slate-200/70 dark:border-white/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Be Part of Something Bigger
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-base mb-8">
              Join thousands of changemakers who are building stronger, more resilient communities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium btn-glow transition-all shadow-sm">
                Start Volunteering
              </Link>
              <Link to="/register?role=ngo" className="px-8 py-3.5 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl font-medium border border-slate-200 dark:border-white/15 transition-colors shadow-sm">
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
