import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  Globe2, 
  CheckCircle2, 
  Heart, 
  TreePine, 
  GraduationCap, 
  Stethoscope, 
  Flame, 
  Palette, 
  Laptop, 
  Compass,
  Clock,
  CalendarCheck
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import OpportunityCard from '../components/ui/OpportunityCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import DepthText from '../components/ui/DepthText';
import { opportunityService } from '../services/opportunityService';

const CATEGORIES = [
  { id: 'environment', name: 'Environment', icon: TreePine, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  { id: 'health', name: 'Healthcare', icon: Stethoscope, color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
  { id: 'community', name: 'Community', icon: Users, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  { id: 'animals', name: 'Animal Welfare', icon: Heart, color: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  { id: 'disaster-relief', name: 'Disaster Relief', icon: Flame, color: 'from-red-500/20 to-amber-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  { id: 'arts', name: 'Arts & Culture', icon: Palette, color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
  { id: 'technology', name: 'Technology', icon: Laptop, color: 'from-cyan-500/20 to-sky-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' }
];

const Home = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    activeOpportunities: 0,
    verifiedNGOs: 0,
    completedEvents: 0,
    totalVolunteers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [oppsRes, statsRes] = await Promise.allSettled([
          opportunityService.getOpportunities({ status: 'published', limit: 3 }),
          opportunityService.getPublicStats()
        ]);

        if (oppsRes.status === 'fulfilled') {
          const list = oppsRes.value?.data?.opportunities || oppsRes.value?.opportunities || (Array.isArray(oppsRes.value?.data) ? oppsRes.value.data : []);
          setOpportunities(list);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <PublicLayout>
      <div className="relative overflow-hidden text-white bg-transparent">
        {/* 1. HERO SECTION */}
        <section className="relative min-h-[80vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Top pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 shadow-glow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
              <span>The Next Generation Social Impact Platform</span>
            </motion.div>

            {/* Headline with DepthText */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-8 flex flex-col items-center justify-center"
            >
              <DepthText
                text="Connect Volunteer"
                layers={34}
                depth={2.4}
                faceColor="#f8fafc"
                depthColor="#7c3aed"
                tilt={7.5}
                pointerTracking
                smoothing={0.14}
                perspective={900}
                autoOrbit
                orbitSpeed={0.35}
                fontSize="clamp(2.8rem, 8.5vw, 6rem)"
                fontWeight={900}
                shadow
              />
              <span className="block gradient-text text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mt-2">
                Make an Impact.
              </span>
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              VolunteerConnect bridges passionate volunteers with verified non-profit organizations. Discover meaningful causes, track your volunteer hours, and receive tamper-proof digital certificates.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-8"
            >
              <Link
                to="/opportunities"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 btn-glow transition-all group"
              >
                <span>Find Opportunities</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register?role=volunteer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
              >
                <span>Join as a Volunteer</span>
              </Link>
            </motion.div>

            {/* NGO Callout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-sm text-gray-400"
            >
              Are you an organization?{' '}
              <Link to="/register?role=ngo" className="text-secondary-400 hover:text-secondary-300 font-semibold underline underline-offset-4 decoration-secondary-500/40">
                Register Your NGO →
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2. REAL IMPACT SUMMARY (Atlas Backed) */}
        <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-glass hover:bg-white/[0.06] transition-all">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-400 mb-1">
                  {stats.activeOpportunities}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Active Opportunities
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-glass hover:bg-white/[0.06] transition-all">
                <p className="text-3xl sm:text-4xl font-extrabold text-secondary-400 mb-1">
                  {stats.verifiedNGOs}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Verified NGOs
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-glass hover:bg-white/[0.06] transition-all">
                <p className="text-3xl sm:text-4xl font-extrabold text-accent-400 mb-1">
                  {stats.totalVolunteers}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Registered Volunteers
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-glass hover:bg-white/[0.06] transition-all">
                <p className="text-3xl sm:text-4xl font-extrabold text-purple-400 mb-1">
                  {stats.completedEvents}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Completed Events
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Simple 4-Step Process</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
                How VolunteerConnect Works
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mt-4">
                From finding an initiative that inspires you to receiving certified proof of service, we make volunteering effortless and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Discover Causes', desc: 'Filter by category, city, date, and required skills to find projects matching your passions.', icon: Compass },
                { step: '02', title: 'Apply in 1-Click', desc: 'Submit your interest directly. Verified NGOs review applications with instant notifications.', icon: CheckCircle2 },
                { step: '03', title: 'Make an Impact', desc: 'Participate on the ground or virtually. Attendance is tracked digitally by organizers.', icon: CalendarCheck },
                { step: '04', title: 'Earn Recognition', desc: 'Receive official, verifiable digital certificates with hours completed for your civic resume.', icon: Award }
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-8 relative border border-white/10 hover:border-primary-500/40 transition-all hover:-translate-y-1">
                  <span className="text-4xl font-black text-white/10 absolute top-6 right-6 font-mono">{item.step}</span>
                  <div className="p-3.5 rounded-xl bg-primary-500/10 text-primary-400 w-fit mb-6 border border-primary-500/20">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 & 5. VOLUNTEER & NGO JOURNEYS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Volunteer Card */}
              <div className="glass-card p-8 sm:p-10 border border-primary-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 text-xs font-semibold mb-6">
                  <Users className="w-3.5 h-3.5" /> For Volunteers
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Turn Your Passion into Meaningful Change
                </h3>
                <ul className="space-y-3.5 text-sm text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                    <span>Personalized opportunity recommendations based on your skills and location.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                    <span>Real-time status tracking from application to event completion.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                    <span>Verified certificate gallery with unique ID codes for LinkedIn & resumes.</span>
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-glow-sm"
                >
                  <span>Start Volunteering</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* NGO Card */}
              <div className="glass-card p-8 sm:p-10 border border-secondary-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-500/15 text-secondary-300 text-xs font-semibold mb-6">
                  <Building2 className="w-3.5 h-3.5" /> For Non-Profits & NGOs
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Streamline Volunteer Recruitment & Management
                </h3>
                <ul className="space-y-3.5 text-sm text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-400 shrink-0 mt-0.5" />
                    <span>Official Verified NGO Badge following swift admin document verification.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-400 shrink-0 mt-0.5" />
                    <span>Publish opportunities, review applicant profiles, and approve participants in bulk.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary-400 shrink-0 mt-0.5" />
                    <span>Built-in attendance checklists that automatically issue participant certificates.</span>
                  </li>
                </ul>
                <Link
                  to="/register?role=ngo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-secondary-600 hover:bg-secondary-500 transition-colors"
                >
                  <span>Register Your Organization</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. OPPORTUNITY CATEGORIES */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Causes That Matter</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
                Explore by Category
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mt-4">
                Find the initiatives where your background, passion, and skills can create the greatest positive outcome.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/opportunities?category=${cat.id}`}
                  className={`group p-6 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-[1.03] transition-all duration-300 flex flex-col items-center text-center`}
                >
                  <div className={`p-4 rounded-xl bg-white/10 backdrop-blur-md ${cat.text} mb-4 shadow-sm group-hover:rotate-6 transition-transform`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{cat.name}</h3>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                    Explore opportunities →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 7. LIVE OPPORTUNITIES PREVIEW (Real Atlas Data) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Take Action Today</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                  Featured Opportunities
                </h2>
              </div>
              <Link
                to="/opportunities"
                className="text-sm font-semibold text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
              >
                <span>View All Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp._id} opportunity={opp} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center border border-white/10 max-w-xl mx-auto">
                <EmptyState
                  title="No opportunities published yet"
                  description="Be the first verified organization to publish a volunteer opportunity on VolunteerConnect!"
                  icon={Compass}
                  action={{
                    label: 'Register Your NGO',
                    onClick: () => window.location.href = '/register?role=ngo'
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* 8. TRUST & VERIFICATION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent-400">Uncompromising Integrity</span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                  Built on Trust, Verified Authenticity
                </h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  We believe community service requires absolute safety and credibility. Every organization on VolunteerConnect undergoes formal verification by our administrative board before posting events.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-accent-500/15 text-accent-400 border border-accent-500/25 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Official Document Verification</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Government registration certificates and credentials are confirmed manually.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary-500/15 text-primary-400 border border-primary-500/25 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Cryptographically Serialized Certificates</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Every certificate generated carries a unique verification identifier to prevent fraud.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-secondary-500/15 text-secondary-400 border border-secondary-500/25 shrink-0">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Real-Time Attendance Auditing</h4>
                      <p className="text-sm text-gray-400 mt-0.5">Event organizers check in volunteers digitally, ensuring accurate hour tracking.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="glass-card p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs text-primary-400 font-semibold uppercase">Platform Guarantee</span>
                      <h3 className="text-xl font-bold text-white mt-0.5">Certified Organization Badge</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="py-6 space-y-4 text-sm text-gray-300">
                    <p>
                      Volunteers never have to wonder whether an organization is legitimate. When you see the <span className="text-accent-400 font-semibold">Verified NGO badge</span>, you can be certain that registration documents have been validated.
                    </p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0" />
                      <span className="text-xs text-gray-300">100% of published events are hosted by approved NGOs.</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Questions about verification?</span>
                    <Link to="/contact" className="text-xs font-semibold text-primary-400 hover:text-primary-300">
                      Speak with our team →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. GLOBAL IMPACT CALL TO ACTION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-16 relative overflow-hidden bg-gradient-to-br from-primary-950/40 via-purple-950/30 to-gray-950/40 backdrop-blur-2xl border border-primary-500/30 shadow-glass text-center">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                Ready to Create Real Change in the World?
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed">
                Join our community of changemakers today. It takes less than 2 minutes to get started as a volunteer or register your non-profit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 btn-glow transition-all"
                >
                  Sign Up as Volunteer
                </Link>
                <Link
                  to="/register?role=ngo"
                  className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
                >
                  Register Your NGO
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Home;
