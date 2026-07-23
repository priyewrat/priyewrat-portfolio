import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, FolderGit, GraduationCap, Award, Mail, 
  MapPin, Phone, Lock, Sun, Moon, ArrowRight,
  ExternalLink, Code, CheckCircle, Send, MessageCircle
} from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioData, Experience, Project, JobType, Message } from '../types';
import { getPortfolioData, addMessage } from '../lib/storage';

interface PortfolioViewProps {
  onLoginClick: () => void;
  portfolioData: PortfolioData;
}

export default function PortfolioView({ onLoginClick, portfolioData }: PortfolioViewProps) {
  const [data, setData] = useState<PortfolioData>(portfolioData);
  const [selectedJobType, setSelectedJobType] = useState<JobType | 'All'>('All');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return saved !== null ? saved === 'dark' : true;
  });
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    text: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setData(portfolioData);
  }, [portfolioData]);

  // Handle dark mode side effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('portfolio-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('portfolio-theme', 'light');
    }
  }, [darkMode]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    setTimeout(() => {
      addMessage({
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        text: contactForm.text
      });
      
      setSending(false);
      setFormSubmitted(true);
      setContactForm({ name: '', email: '', subject: '', text: '' });
      
      setTimeout(() => setFormSubmitted(false), 4000);
    }, 600);
  };

  // Filter experiences based on selectedJobType
  const filteredExperiences = selectedJobType === 'All' 
    ? data.experiences 
    : data.experiences.filter(exp => exp.type === selectedJobType);

  // Group skills by category for a structured bento presentation
  const skillsByCategory = data.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  const skillCategoriesOrder = Array.from(new Set(data.skills.map(s => s.category)));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            {data.profile.avatarUrl ? (
              <img 
                src={data.profile.avatarUrl} 
                alt={data.profile.name} 
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/20 shadow-md group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                P
              </div>
            )}
            <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-white">
              {data.profile.name}
            </span>
          </a>

          {/* Nav links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">About</a>
            <a href="#skills" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Skills</a>
            <a href="#experience" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Projects</a>
            <a href="#education" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Education</a>
            <a href="#contact" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 rounded-xl transition cursor-pointer"
              aria-label="Toggle visual theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Admin Access lock icon */}
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition border border-zinc-200/50 dark:border-zinc-800 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Access</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 glow-bg opacity-40 pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full glow-bg-blue opacity-50 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold tracking-wide border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle className="w-3.5 h-3.5" />
                Available for Full Time & Remote Projects
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                Hi, I'm <span className="text-emerald-600 dark:text-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">{data.profile.name}</span>
              </h1>
              
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300">
                {data.profile.title}
              </h2>
              
              <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {data.profile.summary}
              </p>

              {/* Bio Highlights / Contact Metadata */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-y-3 gap-x-6 text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{data.profile.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span>{data.profile.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>{data.profile.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 pt-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/10 text-sm"
                >
                  Contact Me
                  <ArrowRight className="w-4 h-4" />
                </a>
                
                <a
                  href="#projects"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl transition border border-zinc-200 dark:border-zinc-800 text-sm shadow-xs"
                >
                  View Work
                </a>

                {/* Social icons */}
                <div className="flex items-center gap-2 sm:ml-4">
                  <a
                    href={data.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400 dark:hover:text-white rounded-xl transition border border-zinc-200/30 dark:border-zinc-800"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="w-4.5 h-4.5" />
                  </a>
                  <a
                    href={data.profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400 dark:hover:text-white rounded-xl transition border border-zinc-200/30 dark:border-zinc-800"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Visual Block / Circle Profile Image */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex items-center justify-center">
              <div className="relative group">
                {/* Glowing background halo */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 opacity-25 blur-xl group-hover:opacity-35 transition-opacity duration-500"></div>
                
                {/* Custom triple border/ring layout */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-tr from-emerald-500/20 via-zinc-200 to-teal-500/20 dark:from-emerald-500/10 dark:via-zinc-800 dark:to-teal-500/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="w-full h-full rounded-full p-1.5 bg-white dark:bg-zinc-950">
                    <img 
                      src={data.profile.avatarUrl || "https://avatars.githubusercontent.com/u/165651975?v=4"} 
                      alt={data.profile.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-zinc-100 dark:border-zinc-900 shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Pulsing online status indicator */}
                  <div className="absolute top-4 left-4 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-zinc-950 rounded-full shadow-md">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Skills Bento Section */}
      <section id="skills" className="py-20 bg-white dark:bg-zinc-900 border-y border-zinc-150 dark:border-zinc-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Technical Expertise & Tools
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Priyewrat has comprehensive expertise in building complete end-to-end full-stack applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategoriesOrder.map((cat) => {
              const categorySkills = skillsByCategory[cat] || [];
              if (categorySkills.length === 0) return null;
              
              return (
                <div 
                  key={cat}
                  className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-400/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                      {cat}
                    </h3>
                    <div className="w-8 h-8 rounded-lg bg-zinc-150 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                      <Code className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-150 dark:border-zinc-800 shadow-3xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Experience Timeline Section */}
      <section id="experience" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Professional Experience
              </h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                A rich career background comprising of developer internships, research assistant project roles, and outreach programs.
              </p>
            </div>

            {/* JOB TYPE FILTER BUTTONS */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-150 dark:bg-zinc-900 rounded-xl max-w-max border border-zinc-200 dark:border-zinc-800">
              {(['All', 'Full Time', 'Part Time', 'Freelance', 'Internship'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedJobType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedJobType === type
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Briefcase className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No experiences matching "{selectedJobType}" found.</p>
                <button 
                  onClick={() => setSelectedJobType('All')}
                  className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Clear filter and view all
                </button>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 sm:before:left-1/2 before:-translate-x-1/2 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
                {filteredExperiences.map((exp, idx) => (
                  <div key={exp.id} className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12 group">
                    
                    {/* Time dot locator */}
                    <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-emerald-500 border-4 border-zinc-50 dark:border-zinc-950 transition-colors z-10 top-5"></div>
                    
                    {/* Duration / Period alignment */}
                    <div className={`pl-12 sm:pl-0 sm:text-right flex items-center sm:justify-end ${idx % 2 === 0 ? 'sm:order-first' : 'sm:order-last'}`}>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {exp.duration}
                      </span>
                    </div>

                    {/* Card Content container */}
                    <div className={`pl-12 sm:pl-0 ${idx % 2 === 0 ? 'sm:order-last' : 'sm:order-first'}`}>
                      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs hover:border-emerald-500/20 transition-all">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white leading-tight">
                            {exp.role}
                          </h3>
                          <span className="px-2 py-0.5 text-4xs font-bold uppercase tracking-wider rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {exp.type}
                          </span>
                        </div>
                        
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {exp.company}
                        </p>
                        <p className="text-3xs text-zinc-400 dark:text-zinc-500 mb-4 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-500" /> {exp.location}
                        </p>

                        <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 pl-4 list-disc marker:text-emerald-500">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Projects Section */}
      <section id="projects" className="py-20 bg-white dark:bg-zinc-900 border-y border-zinc-150 dark:border-zinc-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Featured Engineering Projects
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Interactive projects reflecting research in AI automated agents, computer vision databases, and complex state routing architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.projects.map((p) => (
              <div 
                key={p.id}
                className="flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                {/* Visual Accent header */}
                <div className="h-1.5 w-full bg-linear-to-r from-emerald-600 to-teal-400 dark:from-emerald-500 dark:to-teal-300"></div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-3xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.duration}</span>
                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white mt-1 leading-snug tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="mt-4 border-t border-zinc-150 dark:border-zinc-850 pt-4">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Key Highlights:</h4>
                      <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 list-disc pl-4 marker:text-emerald-500">
                        {p.bullets.map((bullet, index) => (
                          <li key={index} className="line-clamp-2 leading-snug">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-150 dark:border-zinc-850">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {p.technologies.map((tech, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 text-4xs font-bold uppercase bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-800 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-2xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live App</span>
                        </a>
                      )}
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-2xs font-extrabold text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                          <span>Repository</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Education & Certifications Timeline */}
      <section id="education" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Education Timeline */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-emerald-500" />
                  Education History
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Full academic degrees held by Priyewrat.</p>
              </div>

              <div className="space-y-6">
                {data.educations.map((edu) => (
                  <div key={edu.id} className="relative pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-emerald-500 before:transition-all before:duration-300 rounded-r-2xl bg-white dark:bg-zinc-900 p-5 border-y border-r border-zinc-150 dark:border-zinc-850 shadow-3xs hover:shadow-md hover:-translate-y-0.5 hover:bg-emerald-50/5 dark:hover:bg-emerald-950/5 hover:border-emerald-500/25 dark:hover:border-emerald-500/20 transition-all duration-300 group hover:before:w-1.5">
                    <span className="text-3xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{edu.duration}</span>
                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white mt-1 leading-tight">{edu.degree}</h3>
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{edu.institution} &bull; {edu.location}</p>
                    
                    <div className="mt-3.5 inline-flex items-center px-2.5 py-1 bg-zinc-50 dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 border border-zinc-150 dark:border-zinc-800 rounded-lg text-2xs font-bold">
                      Grade Score: {edu.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Block */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-emerald-500" />
                  Credentials & Certifications
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Verified achievements and industry credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.certifications.map((c) => (
                  <div key={c.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-3xs hover:border-emerald-500/20 transition-all">
                    <div>
                      <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-xs text-zinc-950 dark:text-white leading-tight line-clamp-2">
                        {c.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">{c.issuer}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-4xs font-bold text-zinc-400 font-mono">Credited Year: {c.year}</span>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Contact Submission Section */}
      <section id="contact" className="py-20 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Context details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Let's Collaborate
                </h2>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                  Have an exciting role, software gig, or simply want to inquire about engineering architectures? Drop a note here! Submissions route straight to the local Admin Dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-3xs">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Email Direct</h4>
                    <a href={`mailto:${data.profile.email}`} className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:underline">
                      {data.profile.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-3xs">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Phone Call</h4>
                    <a href={`tel:${data.profile.phone}`} className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:underline">
                      {data.profile.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-3xs group hover:border-emerald-500/25 dark:hover:border-emerald-500/20 hover:shadow-xs transition duration-250">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">WhatsApp</h4>
                    <a 
                      href="https://wa.me/919608155534" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Chat on WhatsApp</span>
                      <ExternalLink className="w-3 h-3 text-emerald-500" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 shadow-3xs">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Based In</h4>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {data.profile.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Contact Form */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative">
              
              <AnimatePresence>
                {formSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-3xl z-10 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                      <Send className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Inquiry Forwarded Successfully!</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
                      Your inquiry has been stored. You can view, read, or delete this message by accessing the **Admin Panel** locks above!
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-6 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-xs font-bold text-zinc-700 dark:text-zinc-300 rounded-xl transition"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Inquiry regarding backend vacancy"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Detailed Message</label>
                  <textarea
                    required
                    rows={5}
                    value={contactForm.text}
                    onChange={(e) => setContactForm({ ...contactForm, text: e.target.value })}
                    placeholder="Write your brief message outline here..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-md shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sending ? 'Posting Message...' : 'Submit Inquiry'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      </section>

      {/* 8. Modern Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-300">Patna, Bihar, India</span>
          </div>
          <p className="text-zinc-500">
            &copy; {new Date().getFullYear()} {data.profile.name}. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-2xs font-semibold text-zinc-500">
            <button onClick={onLoginClick} className="hover:text-emerald-400 transition-colors cursor-pointer">Admin Login Control</button>
            <span>&bull;</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Back to top</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
