import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  RotateCcw,
  ShieldCheck, 
  Award, 
  Users, 
  Building2, 
  CheckCircle2, 
  Heart, 
  TreePine, 
  GraduationCap, 
  Stethoscope, 
  Flame, 
  Palette, 
  Laptop, 
  Compass,
  UserCheck,
  CalendarCheck,
  Clock,
  MapPin
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import OpportunityCard from '../components/ui/OpportunityCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import { opportunityService } from '../services/opportunityService';

const SEARCH_PROMPTS = [
  'Beach cleanup & marine conservation',
  'Teach coding & mathematics to children',
  'Emergency disaster relief & food packaging',
  'Rescue animal care & pet adoption drive',
  'Planting 1,000 urban native trees',
  'Senior citizen companionship & support',
];

const POPULAR_TAGS = [
  { label: 'Environment', category: 'environment', bg: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]' },
  { label: 'Education', category: 'education', bg: 'bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb]' },
  { label: 'Healthcare', category: 'health', bg: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]' },
  { label: 'Community', category: 'community', bg: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]' },
  { label: 'Animal Welfare', category: 'animals', bg: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]' },
  { label: 'Disaster Relief', category: 'disaster-relief', bg: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]' },
];

const CATEGORIES = [
  { id: 'environment', name: 'Environment', icon: TreePine, color: 'bg-[#D8EEE5]/70 border-[#bce1d3]', text: 'text-[#244e44]' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-[#C9DDF2]/70 border-[#a3c5eb]', text: 'text-[#24426b]' },
  { id: 'health', name: 'Healthcare', icon: Stethoscope, color: 'bg-[#F2D6DD]/70 border-[#e6b5c1]', text: 'text-[#8C3B4A]' },
  { id: 'community', name: 'Community', icon: Users, color: 'bg-[#F6D8C5]/70 border-[#eebd9e]', text: 'text-[#7a4221]' },
  { id: 'animals', name: 'Animal Welfare', icon: Heart, color: 'bg-[#DDD5F3]/70 border-[#c5b8eb]', text: 'text-[#4d387a]' },
  { id: 'disaster-relief', name: 'Disaster Relief', icon: Flame, color: 'bg-[#F2D6DD]/70 border-[#e6b5c1]', text: 'text-[#8C3B4A]' },
  { id: 'arts', name: 'Arts & Culture', icon: Palette, color: 'bg-[#DDD5F3]/70 border-[#c5b8eb]', text: 'text-[#4d387a]' },
  { id: 'technology', name: 'Technology', icon: Laptop, color: 'bg-[#C9DDF2]/70 border-[#a3c5eb]', text: 'text-[#24426b]' }
];

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Discover',
    tag: 'Explore Causes',
    desc: 'Browse verified social causes by category, location, and required skills to find initiatives that inspire you.',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
  },
  {
    num: '02',
    title: 'Register',
    tag: 'Instant Onboarding',
    desc: 'Create your profile in 60 seconds as an individual changemaker or apply for verified non-profit credentials.',
    icon: UserCheck,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80'
  },
  {
    num: '03',
    title: 'Find Opportunities',
    tag: 'Smart Matching',
    desc: 'Filter opportunities matching your schedule. One-click application with instant status updates.',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'
  },
  {
    num: '04',
    title: 'Volunteer',
    tag: 'Ground Impact',
    desc: 'Participate in on-site or virtual initiatives. Organizers verify attendance with digital checklists.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80'
  },
  {
    num: '05',
    title: 'Make an Impact',
    tag: 'Certified Proof',
    desc: 'Receive tamper-proof digital certificates with hours completed for your civic resume and career portfolio.',
    icon: Award,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80'
  }
];

// Clean non-flipping real photo cards (Requirement 7 & 8)
const REAL_COMMUNITY_STORIES = [
  {
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
    title: 'Coastal Habitat Restoration',
    desc: 'Volunteers gathered to clean 3 miles of shoreline and restore indigenous dunes.',
    tag: 'Environment',
    tagStyle: 'bg-[#D8EEE5] text-[#244e44] border-[#bce1d3]'
  },
  {
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80',
    title: 'Urban Garden Renewal',
    desc: 'Neighbors planted community vegetable patches producing sustainable fresh food.',
    tag: 'Community',
    tagStyle: 'bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e]'
  },
  {
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80',
    title: 'Nutrition Kit Distribution',
    desc: 'Packaged over 2,400 balanced meals for local community pantries.',
    tag: 'Food Drive',
    tagStyle: 'bg-[#F2D6DD] text-[#8C3B4A] border-[#e6b5c1]'
  },
  {
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    title: 'Shelter Rescue Support',
    desc: 'Helped provide medical care, grooming, and loving foster matching for 48 pets.',
    tag: 'Animal Welfare',
    tagStyle: 'bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb]'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState({
    activeOpportunities: 0,
    verifiedNGOs: 0,
    completedEvents: 0,
    totalVolunteers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchQuery.length > 0) return;
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % SEARCH_PROMPTS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const query = searchQuery.trim() || SEARCH_PROMPTS[promptIndex];
    navigate(`/opportunities?search=${encodeURIComponent(query)}`);
  };

  const handleTagClick = (cat) => {
    navigate(`/opportunities?category=${cat}`);
  };

  const handleShufflePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % SEARCH_PROMPTS.length);
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [oppsRes, statsRes] = await Promise.allSettled([
          opportunityService.getOpportunities({ status: 'published', limit: 6 }),
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
      <div className="relative text-[#354052] bg-transparent">
        
        {/* 1. PROFESSIONAL HERO SECTION (Requirements 9, 10, 11) */}
        <section className="relative pt-6 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* LEFT COLUMN: HERO COPY & ACTIONS */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Small badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E6E8EC] shadow-soft-sm">
                  <span className="w-2 h-2 rounded-full bg-[#54947f] animate-pulse" />
                  <span className="text-xs font-semibold text-[#26372B]">
                    Connecting People With Purpose
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#26372B] tracking-tight leading-[1.18]">
                  Make a Difference.<br />
                  <span className="text-[#556e5a]">One Opportunity at a Time.</span>
                </h1>

                {/* Supporting Text */}
                <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
                  VolunteerConnect brings volunteers and organizations together to create meaningful community impact. Discover verified causes, track service hours, and earn digital certificates.
                </p>

                {/* Primary & Secondary Buttons (Requirement 10 & 13) */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/opportunities"
                    className="btn-primary-pastel inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/register?role=volunteer"
                    className="btn-secondary-pastel inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
                  >
                    <span>Join as a Volunteer</span>
                  </Link>
                </div>

                {/* Compact Interactive Search Bar */}
                <div className="pt-2">
                  <form 
                    onSubmit={handleSearchSubmit}
                    className="relative flex items-center p-1.5 rounded-2xl bg-white/95 border border-[#E6E8EC] shadow-soft-md focus-within:border-[#BFD8C2] focus-within:ring-2 focus-within:ring-[#BFD8C2]/40 transition-all max-w-lg"
                  >
                    <div className="pl-3 pr-2 text-[#667085] flex items-center pointer-events-none">
                      <Search className="w-4 h-4" />
                    </div>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Try: "${SEARCH_PROMPTS[promptIndex]}"`}
                      className="flex-1 bg-transparent text-[#354052] placeholder-[#98A2B3] text-xs sm:text-sm outline-none px-2 py-1.5 font-medium"
                    />

                    <div className="flex items-center gap-1 shrink-0 pr-1">
                      <button
                        type="button"
                        onClick={handleShufflePrompt}
                        title="Shuffle suggestion"
                        className="p-1.5 text-[#667085] hover:text-[#26372B] hover:bg-black/[0.04] rounded-xl transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="submit"
                        className="btn-primary-pastel inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs"
                      >
                        <span>Search</span>
                      </button>
                    </div>
                  </form>

                  {/* Popular Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-[11px] font-medium text-[#667085] mr-1">Popular:</span>
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag.category}
                        type="button"
                        onClick={() => handleTagClick(tag.category)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-soft-sm transition-transform hover:-translate-y-0.5 ${tag.bg}`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: REAL-WORLD PHOTOGRAPHY CONTAINER (Requirement 10 & 11) */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                {/* Requirement 11: Subtle animated pastel blobs behind hero image */}
                <div 
                  className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[65px] animate-blob-slow pointer-events-none"
                  style={{ backgroundColor: 'rgba(221, 213, 243, 0.45)' }} // Pale lavender
                />
                <div 
                  className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-[65px] animate-blob-slow pointer-events-none"
                  style={{ backgroundColor: 'rgba(216, 238, 229, 0.50)', animationDelay: '5s' }} // Mint
                />
                <div 
                  className="absolute top-1/2 -right-8 w-52 h-52 rounded-full blur-[60px] animate-blob-slow pointer-events-none"
                  style={{ backgroundColor: 'rgba(246, 216, 197, 0.40)', animationDelay: '9s' }} // Soft peach
                />

                {/* Hero Image in Modern Rounded Container */}
                <div className="relative w-full max-w-md aspect-[4/3.2] sm:aspect-[4/3.3] rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-soft-lg bg-white z-10">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80"
                    alt="Volunteers planting native trees in an urban community park"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Badges */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E6E8EC] text-[#26372B] font-semibold flex items-center gap-1.5 shadow-soft-sm">
                      <ShieldCheck className="w-4 h-4 text-[#54947f]" />
                      <span>100% Vetted NGOs</span>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E6E8EC] text-[#26372B] font-semibold flex items-center gap-1.5 shadow-soft-sm">
                      <Award className="w-4 h-4 text-[#8e74d1]" />
                      <span>Verified Impact</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. REAL IMPACT SUMMARY (Atlas Backed Data) */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 border-y border-[#E6E8EC] bg-white/50 backdrop-blur-md">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#26372B]">
                  {stats.activeOpportunities}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] mt-1">
                  Active Opportunities
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#466c9c]">
                  {stats.verifiedNGOs}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] mt-1">
                  Verified NGOs
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#54947f]">
                  {stats.totalVolunteers}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] mt-1">
                  Registered Volunteers
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#E6E8EC] shadow-soft-sm">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#7556bf]">
                  {stats.completedEvents}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] mt-1">
                  Completed Events
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CLEAN MODERN REAL-PHOTO CARDS (Requirement 7 & 8: NO FLIP CARDS) */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#556e5a]">
                  Real Community Moments
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mt-1">
                  Stories of Meaningful Impact
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] mt-1">
                  Genuine photography from recent volunteer initiatives and verified community drives.
                </p>
              </div>
              <Link to="/about" className="text-xs sm:text-sm font-semibold text-[#556e5a] hover:text-[#26372B] flex items-center gap-1">
                <span>Learn about our mission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Clean non-flipping modern cards with subtle zoom and translateY(-4px) on hover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {REAL_COMMUNITY_STORIES.map((story, i) => (
                <div
                  key={i}
                  className="glass-card group flex flex-col overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-soft-hover"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={story.image}
                      alt={story.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md ${story.tagStyle}`}>
                      {story.tag}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-[#26372B] mb-1.5 group-hover:text-[#556e5a] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-[#667085] leading-relaxed">
                      {story.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS (5-STEP WORKFLOW) */}
        <section id="how-it-works" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#556e5a]">Step-by-Step Pathway</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mt-1">
                How VolunteerConnect Works
              </h2>
              <p className="text-[#667085] text-xs sm:text-sm mt-2">
                From finding an initiative that inspires you to receiving certified proof of service, we make volunteering simple and transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <div 
                  key={step.num}
                  className="glass-card p-4 flex flex-col justify-between group hover:-translate-y-1 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black font-mono text-[#BFD8C2] group-hover:text-[#556e5a] transition-colors">
                        {step.num}
                      </span>
                      <div className="p-2 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3]">
                        <step.icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-3 bg-slate-100 border border-[#E6E8EC]">
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white uppercase tracking-wider">
                        {step.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#26372B] mb-1 group-hover:text-[#556e5a] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#667085] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E6E8EC] flex items-center text-[11px] font-semibold text-[#556e5a]">
                    <span>Step {idx + 1} of 5</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. VOLUNTEER & NGO PATHWAYS (Requirement 21) */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Volunteer Pathway: Sage + Powder Blue */}
              <div className="glass-card p-6 sm:p-8 border border-[#BFD8C2]/80 relative overflow-hidden bg-gradient-to-br from-white/95 via-[#f5f9f6]/90 to-[#eef5fa]/90">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] text-xs font-semibold mb-4">
                  <Users className="w-3.5 h-3.5" /> For Volunteers
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#26372B] mb-3">
                  Turn Your Passion into Meaningful Change
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#667085] mb-6">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#54947f] shrink-0 mt-0.5" />
                    <span>Personalized opportunity recommendations based on your skills and location.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#54947f] shrink-0 mt-0.5" />
                    <span>Real-time status tracking from application to event completion.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#54947f] shrink-0 mt-0.5" />
                    <span>Verified certificate gallery with unique ID codes for LinkedIn and civic resumes.</span>
                  </li>
                </ul>
                <Link
                  to="/register?role=volunteer"
                  className="btn-primary-pastel inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm"
                >
                  <span>Start Volunteering</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* NGO Pathway: Lavender + Blush + Cream */}
              <div className="glass-card p-6 sm:p-8 border border-[#DDD5F3]/80 relative overflow-hidden bg-gradient-to-br from-white/95 via-[#faf8fe]/90 to-[#fdf7f8]/90">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDD5F3] text-[#4d387a] border border-[#c5b8eb] text-xs font-semibold mb-4">
                  <Building2 className="w-3.5 h-3.5" /> For Non-Profits & NGOs
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#26372B] mb-3">
                  Streamline Volunteer Recruitment & Events
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#667085] mb-6">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8e74d1] shrink-0 mt-0.5" />
                    <span>Official Verified NGO Badge following swift admin document verification.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8e74d1] shrink-0 mt-0.5" />
                    <span>Publish opportunities, review applicant profiles, and approve participants in bulk.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#8e74d1] shrink-0 mt-0.5" />
                    <span>Digital attendance checklists that automatically issue serialized certificates.</span>
                  </li>
                </ul>
                <Link
                  to="/register?role=ngo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#DDD5F3] text-[#4d387a] border border-[#c5b8eb] hover:bg-[#c5b8eb] transition-all shadow-soft-sm"
                >
                  <span>Register Your Organization</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CAUSES BY CATEGORY */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#556e5a]">Causes That Matter</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mt-1">
                Explore by Category
              </h2>
              <p className="text-[#667085] text-xs sm:text-sm mt-1.5">
                Find initiatives where your skills can create the greatest positive outcome.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/opportunities?category=${cat.id}`}
                  className={`p-4 rounded-2xl border ${cat.color} hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center shadow-soft-sm group`}
                >
                  <div className={`p-3 rounded-xl bg-white/90 ${cat.text} mb-3 shadow-soft-sm group-hover:scale-105 transition-transform`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#26372B] mb-0.5">{cat.name}</h3>
                  <span className="text-[11px] text-[#667085] group-hover:text-[#26372B] transition-colors">
                    Explore causes →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 7. LIVE OPPORTUNITIES PREVIEW (Real Database Data) */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#556e5a]">Take Action Today</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mt-1">
                  Featured Opportunities
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] mt-0.5">Explore real verified initiatives from local organizations and community drives.</p>
              </div>
              <Link
                to="/opportunities"
                className="text-xs sm:text-sm font-semibold text-[#556e5a] hover:text-[#26372B] inline-flex items-center gap-1"
              >
                <span>View All Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : opportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {opportunities.slice(0, 3).map((opp) => (
                  <OpportunityCard key={opp._id} opportunity={opp} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No opportunities available yet"
                description="Be the first verified organization to publish a volunteer opportunity on VolunteerConnect!"
                icon={Compass}
                action={{
                  label: 'Register Your NGO',
                  onClick: () => navigate('/register?role=ngo')
                }}
              />
            )}
          </div>
        </section>

        {/* 8. TRUST & VERIFICATION */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#54947f]">Uncompromising Integrity</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B]">
                  Built on Trust, Verified Authenticity
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  We believe community service requires absolute safety and credibility. Every organization on VolunteerConnect undergoes formal verification by our administrative board before posting events.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">Official Document Verification</h4>
                      <p className="text-xs text-[#667085] mt-0.5">Government registration certificates and credentials are confirmed manually.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb] shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">Serialized Digital Certificates</h4>
                      <p className="text-xs text-[#667085] mt-0.5">Every certificate generated carries a unique verification identifier to prevent fraud.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#F6D8C5] text-[#7a4221] border-[#eebd9e] shrink-0">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#26372B]">Real-Time Attendance Auditing</h4>
                      <p className="text-xs text-[#667085] mt-0.5">Event organizers check in volunteers digitally, ensuring accurate hour tracking.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="glass-card p-6 sm:p-8 border border-[#E6E8EC]">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E6E8EC]">
                    <div>
                      <span className="text-[11px] text-[#556e5a] font-semibold uppercase">Platform Guarantee</span>
                      <h3 className="text-base sm:text-lg font-bold text-[#26372B] mt-0.5">Certified Organization Badge</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="py-4 space-y-3 text-xs sm:text-sm text-[#667085]">
                    <p>
                      Volunteers never have to wonder whether an organization is legitimate. When you see the <span className="text-[#556e5a] font-semibold">Verified NGO badge</span>, you can be certain that registration documents have been validated.
                    </p>
                    <div className="p-3 rounded-xl bg-white border border-[#E6E8EC] flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#54947f] shrink-0" />
                      <span className="text-xs text-[#354052]">100% of published events are hosted by approved NGOs.</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E6E8EC] flex justify-between items-center text-xs">
                    <span className="text-[#667085]">Questions about verification?</span>
                    <Link to="/contact" className="font-semibold text-[#556e5a] hover:text-[#26372B]">
                      Speak with our team →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. GLOBAL IMPACT CALL TO ACTION */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#FFF8EF] via-white to-[#F5F1FA] border border-[#E6E8EC] shadow-soft-md text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] tracking-tight">
                Ready to Create Real Change in the World?
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Join our community of changemakers today. It takes less than 2 minutes to get started as a volunteer or register your non-profit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/register?role=volunteer"
                  className="btn-primary-pastel px-6 py-3 rounded-xl text-sm"
                >
                  Sign Up as Volunteer
                </Link>
                <Link
                  to="/register?role=ngo"
                  className="btn-secondary-pastel px-6 py-3 rounded-xl text-sm"
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
