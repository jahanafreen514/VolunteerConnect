import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Users, Globe, BarChart, Award, BookOpen, CheckCircle, Sliders, MessageSquare } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';

const About = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-gray-950 to-gray-950"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400"
          >
            Our Mission
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            To bridge the gap between passionate individuals who want to make a difference and verified organizations that need their help.
          </motion.p>
        </div>
      </section>

      {/* The Challenge & Solution */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-red-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">The Challenge</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Many people want to volunteer but struggle to find reliable, verified organizations. Conversely, NGOs often lack the tools to effectively recruit, manage, and engage volunteers. This disconnect results in lost opportunities for impact and community development.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700"
            >
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-primary-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Our Solution</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                VolunteerConnect provides a centralized, secure platform where verified NGOs can list opportunities and volunteers can easily find, apply, and track their contributions. We streamline the entire process to focus on what matters most: the impact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section className="py-20 bg-gray-950 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How We Connect You</h2>
            <p className="text-gray-400">A seamless journey from registration to making an impact</p>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2"></div>
            
            {[
              { title: "Verification", desc: "NGOs undergo a strict admin verification process to ensure authenticity.", side: "left" },
              { title: "Listing", desc: "Approved NGOs post volunteering opportunities with required skills and details.", side: "right" },
              { title: "Matching", desc: "Volunteers search and filter opportunities based on their interests and location.", side: "left" },
              { title: "Action", desc: "Volunteers apply, get accepted, participate, and earn recognition.", side: "right" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center justify-between mb-12 ${step.side === 'left' ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="w-full md:w-5/12"></div>
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold z-10 relative shadow-lg shadow-primary-500/20 my-4 md:my-0">
                  {idx + 1}
                </div>
                <div className={`w-full md:w-5/12 bg-gray-900 p-6 rounded-xl border border-gray-800 ${step.side === 'left' ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">For Volunteers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <BarChart className="w-10 h-10 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Track Impact</h3>
                <p className="text-gray-400">Keep a detailed log of your volunteer hours and past participations all in one place.</p>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <Award className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Earn Certificates</h3>
                <p className="text-gray-400">Receive downloadable certificates from NGOs upon successful completion of tasks.</p>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <BookOpen className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Build Skills</h3>
                <p className="text-gray-400">Gain practical experience, develop new skills, and expand your professional network.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-10 text-center">For NGOs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <CheckCircle className="w-10 h-10 text-accent-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Verified Volunteers</h3>
                <p className="text-gray-400">Access a pool of dedicated volunteers and review their applications before accepting.</p>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <Sliders className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Easy Management</h3>
                <p className="text-gray-400">Manage opportunities, applications, and volunteer attendance through an intuitive dashboard.</p>
              </div>
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                <MessageSquare className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Real Feedback</h3>
                <p className="text-gray-400">Build your organization's reputation on the platform through successful event completions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join our community today</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">
              Start Volunteering
            </Link>
            <Link to="/register?role=ngo" className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700">
              Register as NGO
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
