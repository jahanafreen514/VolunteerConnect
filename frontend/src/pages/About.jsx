import React from 'react';
import { Link } from 'react-router-dom';
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

const About = () => {
  return (
    <PublicLayout>
      <div className="relative text-[#354052] bg-transparent">

        {/* Hero Section with Real Photo */}
        <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E8EC] shadow-soft-sm">
                  <HeartHandshake className="w-4 h-4 text-[#54947f]" />
                  <span className="text-xs font-semibold text-[#26372B]">About VolunteerConnect</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#26372B] tracking-tight leading-tight">
                  Building a World of <span className="text-[#556e5a]">Connected Community Impact</span>
                </h1>

                <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
                  We bridge the gap between passionate volunteers and verified non-profits. Our mission is to transform civic engagement into a transparent, measurable, and deeply rewarding experience.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E6E8EC] shadow-soft-sm">
                    <ShieldCheck className="w-4 h-4 text-[#54947f]" />
                    <span className="text-xs font-bold text-[#26372B]">100% Vetted NGOs</span>
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E6E8EC] shadow-soft-sm">
                    <Award className="w-4 h-4 text-[#8e74d1]" />
                    <span className="text-xs font-bold text-[#26372B]">Serialized Certificates</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-soft-lg aspect-[4/3] bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
                    alt="Volunteers collaborating outdoors on community planting"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-xs font-semibold">Community Planting & Ecological Renewal</p>
                    <p className="text-[11px] text-white/80">Empowering grassroot changemakers</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Mission & Vision Cards */}
        <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-y border-[#E6E8EC] bg-white/40">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Mission Card */}
              <div className="glass-card p-6 sm:p-8 border border-[#BFD8C2]/80 flex flex-col sm:flex-row gap-5 items-center">
                <div className="flex-1 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[#26372B]">Our Mission</h2>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                    To make volunteering accessible, structured, and impactful for every person while empowering NGOs with robust management tools, attendance verification, and automated digital accreditation.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden border border-[#E6E8EC] shrink-0 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80"
                    alt="Volunteers organizing food packages"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Vision Card */}
              <div className="glass-card p-6 sm:p-8 border border-[#DDD5F3]/80 flex flex-col sm:flex-row gap-5 items-center">
                <div className="flex-1 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#DDD5F3] text-[#4d387a] border border-[#c5b8eb] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-[#26372B]">Our Vision</h2>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                    A connected world where civic responsibility is a seamless part of everyday life, verified trust unites communities, and every volunteer hour is permanently recognized.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden border border-[#E6E8EC] shrink-0 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&auto=format&fit=crop&q=80"
                    alt="Community volunteers gardening"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Verification & Trust Section */}
        <section id="verification" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#54947f]">Security & Integrity</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B] mt-1">
                Multi-Layer Verification Process
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] mt-1.5">
                Every organization on VolunteerConnect undergoes formal verification before posting community events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-card p-6 border border-[#E6E8EC]">
                <div className="w-9 h-9 rounded-xl bg-[#D8EEE5] text-[#244e44] border border-[#bce1d3] flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-[#26372B] mb-1.5">Documentation Submission</h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Organizations submit valid government registration documents, tax certificates, and verified representative identification.
                </p>
              </div>

              <div className="glass-card p-6 border border-[#E6E8EC]">
                <div className="w-9 h-9 rounded-xl bg-[#C9DDF2] text-[#24426b] border-[#a3c5eb] flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-[#26372B] mb-1.5">Administrative Review</h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Our administrative board reviews provided credentials against national non-profit registry records.
                </p>
              </div>

              <div className="glass-card p-6 border border-[#E6E8EC]">
                <div className="w-9 h-9 rounded-xl bg-[#DDD5F3] text-[#4d387a] border-[#c5b8eb] flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-[#26372B] mb-1.5">Verified Badge Issued</h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Once approved, the NGO receives the official Verified NGO badge and publishes verified volunteer opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits for Both Sides */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8EC]">
          <div className="max-w-[1200px] mx-auto">
            {/* Volunteers */}
            <div className="mb-10">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#556e5a]">Value For Changemakers</span>
                <h2 className="text-2xl font-bold text-[#26372B] mt-1">Why Volunteers Love VolunteerConnect</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#D8EEE5] text-[#244e44] w-fit mb-3 border border-[#bce1d3]">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Audited Hour Tracking</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Every volunteer hour is recorded digitally through check-ins and logged into your permanent civic service record.
                  </p>
                </div>

                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#C9DDF2] text-[#24426b] w-fit mb-3 border border-[#a3c5eb]">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Official Certificates</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Download serialized digital certificates proving your community leadership and volunteer contributions.
                  </p>
                </div>

                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#F6D8C5] text-[#7a4221] w-fit mb-3 border border-[#eebd9e]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Real Skill Growth</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Gain hands-on experience in leadership, education, environmental restoration, and community management.
                  </p>
                </div>
              </div>
            </div>

            {/* NGOs */}
            <div>
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7556bf]">For Organizations</span>
                <h2 className="text-2xl font-bold text-[#26372B] mt-1">Empowering Non-Profits to Scale</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#DDD5F3] text-[#4d387a] w-fit mb-3 border border-[#c5b8eb]">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Qualified Volunteers</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    Review applicant profiles, skills, and past participation to ensure the right team for every initiative.
                  </p>
                </div>

                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#D8EEE5] text-[#244e44] w-fit mb-3 border border-[#bce1d3]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Automated Operations</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    From event publication to attendee check-ins and certificate issuance, administrative tasks are streamlined.
                  </p>
                </div>

                <div className="glass-card p-5 border border-[#E6E8EC]">
                  <div className="p-2.5 rounded-xl bg-[#F2D6DD] text-[#8C3B4A] w-fit mb-3 border border-[#e6b5c1]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#26372B] mb-1">Verified Credibility</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    The Verified NGO badge signals trustworthiness to prospective volunteers, community partners, and donors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto rounded-3xl p-8 bg-white/90 border border-[#E6E8EC] shadow-soft-md space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26372B]">
              Be Part of Something Bigger
            </h2>
            <p className="text-xs sm:text-sm text-[#667085]">
              Join thousands of changemakers who are building stronger, more resilient communities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/register?role=volunteer" className="btn-primary-pastel px-6 py-2.5 rounded-xl text-sm">
                Start Volunteering
              </Link>
              <Link to="/register?role=ngo" className="btn-secondary-pastel px-6 py-2.5 rounded-xl text-sm">
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
