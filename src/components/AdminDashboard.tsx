import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, FolderGit, GraduationCap, Award, Mail, 
  Plus, Trash2, Edit3, Check, X, FileText, Globe, MapPin, Phone, RefreshCw, Layers, Upload
} from 'lucide-react';
import { PortfolioData, Project, Experience, Education, Certification, Profile, JobType, Message } from '../types';
import { getPortfolioData, savePortfolioData, getMessages, deleteMessage, markMessageAsRead } from '../lib/storage';

interface AdminDashboardProps {
  onLogout: () => void;
  onDataChange: () => void;
}

type AdminTab = 'profile' | 'projects' | 'experience' | 'education' | 'skills' | 'messages';

export default function AdminDashboard({ onLogout, onDataChange }: AdminDashboardProps) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  
  // Notification States
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form Editing States
  const [editProfile, setEditProfile] = useState<Profile | null>(null);

  // Experience form state
  const [expForm, setExpForm] = useState<{
    id?: string;
    role: string;
    company: string;
    location: string;
    type: JobType;
    duration: string;
    bulletsText: string;
  }>({
    role: '',
    company: '',
    location: '',
    type: 'Full Time',
    duration: '',
    bulletsText: ''
  });
  const [isEditingExp, setIsEditingExp] = useState(false);

  // Project form state
  const [projForm, setProjForm] = useState<{
    id?: string;
    title: string;
    description: string;
    techText: string;
    duration: string;
    liveUrl: string;
    githubUrl: string;
    bulletsText: string;
  }>({
    title: '',
    description: '',
    techText: '',
    duration: '',
    liveUrl: '',
    githubUrl: '',
    bulletsText: ''
  });
  const [isEditingProj, setIsEditingProj] = useState(false);

  // Education form state
  const [eduForm, setEduForm] = useState<{
    id?: string;
    degree: string;
    institution: string;
    location: string;
    duration: string;
    score: string;
  }>({
    degree: '',
    institution: '',
    location: '',
    duration: '',
    score: ''
  });
  const [isEditingEdu, setIsEditingEdu] = useState(false);

  // Certification form state
  const [certForm, setCertForm] = useState<{
    id?: string;
    name: string;
    issuer: string;
    year: string;
    url: string;
  }>({
    name: '',
    issuer: '',
    year: '',
    url: ''
  });
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select');

  // Skill form state
  const [skillForm, setSkillForm] = useState<{
    id?: string;
    category: string;
    name: string;
  }>({
    category: '',
    name: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const portfolio = getPortfolioData();
    setData(portfolio);
    setEditProfile(portfolio.profile);
    setMessages(getMessages());
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editProfile) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showNotification('Image size should be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditProfile({
        ...editProfile,
        avatarUrl: base64String
      });
      showNotification('Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editProfile) return;
    
    const updatedData = { ...data, profile: editProfile };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();
    showNotification('Profile updated successfully!');
  };

  // Experience actions
  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const bullets = expForm.bulletsText
      .split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const newExp: Experience = {
      id: expForm.id || 'exp_' + Math.random().toString(36).slice(2, 11),
      role: expForm.role,
      company: expForm.company,
      location: expForm.location,
      type: expForm.type,
      duration: expForm.duration,
      bullets
    };

    let updatedExperiences = [...data.experiences];
    if (expForm.id) {
      updatedExperiences = updatedExperiences.map(exp => exp.id === expForm.id ? newExp : exp);
      showNotification('Experience updated successfully!');
    } else {
      updatedExperiences.unshift(newExp);
      showNotification('New experience added successfully!');
    }

    const updatedData = { ...data, experiences: updatedExperiences };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();
    
    // Reset Form
    setExpForm({
      role: '',
      company: '',
      location: '',
      type: 'Full Time',
      duration: '',
      bulletsText: ''
    });
    setIsEditingExp(false);
  };

  const handleEditExpClick = (exp: Experience) => {
    setExpForm({
      id: exp.id,
      role: exp.role,
      company: exp.company,
      location: exp.location,
      type: exp.type,
      duration: exp.duration,
      bulletsText: exp.bullets.join('\n')
    });
    setIsEditingExp(true);
    // scroll to form
    const element = document.getElementById('exp-form-container');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteExp = (id: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Experience',
      message: 'Are you sure you want to delete this experience entry? This action cannot be undone.',
      onConfirm: () => {
        const updatedExperiences = data.experiences.filter(exp => exp.id !== id);
        const updatedData = { ...data, experiences: updatedExperiences };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification('Experience deleted.');
        setConfirmDialog(null);
      }
    });
  };

  // Project Actions
  const handleSaveProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const bullets = projForm.bulletsText
      .split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const technologies = projForm.techText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newProj: Project = {
      id: projForm.id || 'proj_' + Math.random().toString(36).slice(2, 11),
      title: projForm.title,
      description: projForm.description,
      technologies,
      duration: projForm.duration,
      liveUrl: projForm.liveUrl || undefined,
      githubUrl: projForm.githubUrl || undefined,
      bullets
    };

    let updatedProjects = [...data.projects];
    if (projForm.id) {
      updatedProjects = updatedProjects.map(p => p.id === projForm.id ? newProj : p);
      showNotification('Project updated successfully!');
    } else {
      updatedProjects.unshift(newProj);
      showNotification('New project added successfully!');
    }

    const updatedData = { ...data, projects: updatedProjects };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();

    // Reset
    setProjForm({
      title: '',
      description: '',
      techText: '',
      duration: '',
      liveUrl: '',
      githubUrl: '',
      bulletsText: ''
    });
    setIsEditingProj(false);
  };

  const handleEditProjClick = (p: Project) => {
    setProjForm({
      id: p.id,
      title: p.title,
      description: p.description,
      techText: p.technologies.join(', '),
      duration: p.duration,
      liveUrl: p.liveUrl || '',
      githubUrl: p.githubUrl || '',
      bulletsText: p.bullets.join('\n')
    });
    setIsEditingProj(true);
    const element = document.getElementById('proj-form-container');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteProj = (id: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      onConfirm: () => {
        const updatedProjects = data.projects.filter(p => p.id !== id);
        const updatedData = { ...data, projects: updatedProjects };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification('Project deleted.');
        setConfirmDialog(null);
      }
    });
  };

  // Education Actions
  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const newEdu: Education = {
      id: eduForm.id || 'edu_' + Math.random().toString(36).slice(2, 11),
      degree: eduForm.degree,
      institution: eduForm.institution,
      location: eduForm.location,
      duration: eduForm.duration,
      score: eduForm.score
    };

    let updatedEdu = [...data.educations];
    if (eduForm.id) {
      updatedEdu = updatedEdu.map(edu => edu.id === eduForm.id ? newEdu : edu);
      showNotification('Education updated successfully!');
    } else {
      updatedEdu.push(newEdu);
      showNotification('Education details added!');
    }

    const updatedData = { ...data, educations: updatedEdu };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();

    setEduForm({ degree: '', institution: '', location: '', duration: '', score: '' });
    setIsEditingEdu(false);
  };

  const handleDeleteEdu = (id: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Education Entry',
      message: 'Are you sure you want to delete this education entry? This action cannot be undone.',
      onConfirm: () => {
        const updatedEdu = data.educations.filter(edu => edu.id !== id);
        const updatedData = { ...data, educations: updatedEdu };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification('Education deleted.');
        setConfirmDialog(null);
      }
    });
  };

  const handleEditEduClick = (edu: Education) => {
    setEduForm({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      duration: edu.duration,
      score: edu.score
    });
    setIsEditingEdu(true);
  };

  // Certification Actions
  const handleSaveCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const newCert: Certification = {
      id: certForm.id || 'cert_' + Math.random().toString(36).slice(2, 11),
      name: certForm.name,
      issuer: certForm.issuer,
      year: certForm.year,
      url: certForm.url || undefined
    };

    let updatedCert = [...data.certifications];
    if (certForm.id) {
      updatedCert = updatedCert.map(c => c.id === certForm.id ? newCert : c);
      showNotification('Certification updated!');
    } else {
      updatedCert.push(newCert);
      showNotification('New certification added!');
    }

    const updatedData = { ...data, certifications: updatedCert };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();

    setCertForm({ name: '', issuer: '', year: '', url: '' });
    setIsEditingCert(false);
  };

  const handleEditCertClick = (cert: Certification) => {
    setCertForm({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      year: cert.year,
      url: cert.url || ''
    });
    setIsEditingCert(true);
  };

  const handleDeleteCert = (id: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Certification',
      message: 'Are you sure you want to delete this certification? This action cannot be undone.',
      onConfirm: () => {
        const updatedCert = data.certifications.filter(c => c.id !== id);
        const updatedData = { ...data, certifications: updatedCert };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification('Certification deleted.');
        setConfirmDialog(null);
      }
    });
  };

  // Skill & Category Actions
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !skillForm.category || !skillForm.name) return;

    const newSkill = {
      id: skillForm.id || 'skill_' + Math.random().toString(36).substr(2, 9),
      category: skillForm.category.trim(),
      name: skillForm.name.trim()
    };

    let updatedSkills = [...data.skills];
    if (skillForm.id) {
      updatedSkills = updatedSkills.map(s => s.id === skillForm.id ? newSkill : s);
      showNotification('Skill updated successfully!');
    } else {
      updatedSkills.push(newSkill);
      showNotification('Skill added successfully!');
    }

    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();

    setSkillForm({ category: '', name: '' });
    setIsEditingSkill(false);
  };

  const handleEditSkillClick = (skill: any) => {
    setSkillForm({
      id: skill.id,
      category: skill.category,
      name: skill.name
    });
    setCategoryMode('select');
    setIsEditingSkill(true);
  };

  const handleDeleteSkill = (id: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Skill',
      message: 'Are you sure you want to delete this skill? This action cannot be undone.',
      onConfirm: () => {
        const updatedSkills = data.skills.filter(s => s.id !== id);
        const updatedData = { ...data, skills: updatedSkills };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification('Skill deleted.');
        setConfirmDialog(null);
      }
    });
  };

  const handleRenameCategory = (oldCategory: string, newCategory: string) => {
    if (!data || !oldCategory || !newCategory) return;
    const trimmedNew = newCategory.trim();
    if (!trimmedNew || trimmedNew === oldCategory) return;

    const updatedSkills = data.skills.map(s => 
      s.category === oldCategory ? { ...s, category: trimmedNew } : s
    );

    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    savePortfolioData(updatedData);
    onDataChange();
    showNotification(`Section "${oldCategory}" renamed to "${trimmedNew}".`);
  };

  const handleDeleteCategory = (category: string) => {
    if (!data) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section',
      message: `Are you sure you want to delete the "${category}" section and all skills inside it? This action cannot be undone.`,
      onConfirm: () => {
        const updatedSkills = data.skills.filter(s => s.category !== category);
        const updatedData = { ...data, skills: updatedSkills };
        setData(updatedData);
        savePortfolioData(updatedData);
        onDataChange();
        showNotification(`Section "${category}" deleted.`);
        setConfirmDialog(null);
      }
    });
  };

  // Message Inbox Actions
  const handleMarkAsRead = (id: string) => {
    markMessageAsRead(id);
    setMessages(getMessages());
    showNotification('Message marked as read.');
  };

  const handleDeleteMessage = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Visitor Inquiry',
      message: 'Are you sure you want to delete this visitor inquiry? This action cannot be undone.',
      onConfirm: () => {
        deleteMessage(id);
        setMessages(getMessages());
        showNotification('Message deleted from inbox.');
        setConfirmDialog(null);
      }
    });
  };

  const unreadCount = messages.filter(m => !m.read).length;
  const uniqueCategories = data ? (Array.from(new Set(data.skills.map(s => s.category))) as string[]) : [];

  if (!data || !editProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">Loading resume dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      
      {/* Banner/Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 rounded">
                Admin
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Portfolio Dashboard</h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Currently managing details for <span className="font-semibold text-emerald-600">{data.profile.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl transition cursor-pointer"
              title="Refresh local database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition shadow-xs cursor-pointer"
            >
              Exit Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg border border-zinc-800 dark:border-zinc-100 text-sm animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 mb-3">Sections</h3>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'profile' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Bio Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'projects' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <FolderGit className="w-4 h-4" />
              <span>Projects ({data.projects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'experience' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Experience ({data.experiences.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'education' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Education & Certificates</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'skills' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Skills & Sections ({data.skills.length})</span>
            </button>
            
            <div className="border-t border-zinc-150 dark:border-zinc-800 my-3"></div>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'messages' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Inquiries Inbox</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-emerald-500 dark:bg-emerald-600 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="lg:col-span-9">
            
            {/* 1. Profile Panel */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Bio Information</h2>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editProfile.name}
                          onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Professional Title</label>
                        <input
                          type="text"
                          required
                          value={editProfile.title}
                          onChange={(e) => setEditProfile({ ...editProfile, title: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Contact Email</label>
                        <input
                          type="email"
                          required
                          value={editProfile.email}
                          onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editProfile.phone}
                          onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Location</label>
                        <input
                          type="text"
                          required
                          value={editProfile.location}
                          onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          Profile Photo & Avatar Settings
                        </label>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          {/* Current Preview */}
                          <div className="relative group/avatar flex-shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-emerald-500/20 shadow-md">
                              {editProfile.avatarUrl ? (
                                <img 
                                  src={editProfile.avatarUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
                                  {editProfile.name ? editProfile.name[0] : 'P'}
                                </div>
                              )}
                            </div>
                            {editProfile.avatarUrl && (
                              <button
                                type="button"
                                onClick={() => setEditProfile({ ...editProfile, avatarUrl: '' })}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all hover:scale-110"
                                title="Remove Profile Picture"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Action upload/url controls */}
                          <div className="flex-1 w-full space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* File Input upload button */}
                              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-semibold text-sm rounded-xl cursor-pointer transition shadow-xs">
                                <Upload className="w-4 h-4 text-emerald-500" />
                                <span>Upload Image File</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageUpload} 
                                  className="hidden" 
                                />
                              </label>
                              
                              {/* Tip message */}
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center">
                                Max 2MB (JPG, PNG, WEBP)
                              </span>
                            </div>

                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="url"
                                value={editProfile.avatarUrl || ''}
                                onChange={(e) => setEditProfile({ ...editProfile, avatarUrl: e.target.value })}
                                placeholder="Or enter a custom image URL (e.g., Unsplash/GitHub URL)"
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          required
                          value={editProfile.linkedin}
                          onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">GitHub Profile URL</label>
                        <input
                          type="url"
                          required
                          value={editProfile.github}
                          onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })}
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Professional Summary</label>
                      <textarea
                        required
                        rows={6}
                        value={editProfile.summary}
                        onChange={(e) => setEditProfile({ ...editProfile, summary: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white font-sans leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-xs"
                      >
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. Projects Panel */}
            {activeTab === 'projects' && (
              <div className="space-y-8">
                
                {/* Add/Edit Project Form */}
                <div id="proj-form-container" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <FolderGit className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {projForm.id ? 'Edit Project Details' : 'Add New Project'}
                      </h2>
                    </div>
                    {isEditingProj && (
                      <button
                        type="button"
                        onClick={() => {
                          setProjForm({ title: '', description: '', techText: '', duration: '', liveUrl: '', githubUrl: '', bulletsText: '' });
                          setIsEditingProj(false);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveProj} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Project Title</label>
                        <input
                          type="text"
                          required
                          value={projForm.title}
                          onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                          placeholder="e.g. AI Content Writer"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Project Period / Duration</label>
                        <input
                          type="text"
                          required
                          value={projForm.duration}
                          onChange={(e) => setProjForm({ ...projForm, duration: e.target.value })}
                          placeholder="e.g. Dec 2025 - Mar 2026 or Ongoing"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Technologies used (Comma separated)</label>
                        <input
                          type="text"
                          required
                          value={projForm.techText}
                          onChange={(e) => setProjForm({ ...projForm, techText: e.target.value })}
                          placeholder="React.js, Tailwind CSS, Firebase, Express"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Live URL (Optional)</label>
                          <input
                            type="url"
                            value={projForm.liveUrl}
                            onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">GitHub Repo URL (Optional)</label>
                          <input
                            type="url"
                            value={projForm.githubUrl}
                            onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Short Description</label>
                      <input
                        type="text"
                        required
                        value={projForm.description}
                        onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                        placeholder="Provide a quick one-sentence summary explaining what this project does."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                        Key Accomplishments & Bullet Points (One per line)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={projForm.bulletsText}
                        onChange={(e) => setProjForm({ ...projForm, bulletsText: e.target.value })}
                        placeholder="e.g. Engineered FastAPI routes lowering response latency by 40%&#10;Designed secure MongoDB database layout"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white font-sans"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
                      >
                        {projForm.id ? 'Save Updates' : 'Add Project Card'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Project List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Current Project Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.projects.map((p) => (
                      <div key={p.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between shadow-xs">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{p.title}</h4>
                            <span className="text-2xs text-zinc-400 dark:text-zinc-500 font-mono whitespace-nowrap">{p.duration}</span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {p.technologies.slice(0, 4).map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 text-3xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {tech}
                              </span>
                            ))}
                            {p.technologies.length > 4 && (
                              <span className="px-1 py-0.5 text-3xs font-medium text-zinc-400">+{p.technologies.length - 4}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-4">
                          <button
                            type="button"
                            onClick={() => handleEditProjClick(p)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition"
                            title="Edit project"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProj(p.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 3. Experiences Panel */}
            {activeTab === 'experience' && (
              <div className="space-y-8">
                
                {/* Add/Edit Experience Form */}
                <div id="exp-form-container" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {expForm.id ? 'Edit Experience Details' : 'Add Professional Experience'}
                      </h2>
                    </div>
                    {isEditingExp && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpForm({ role: '', company: '', location: '', type: 'Full Time', duration: '', bulletsText: '' });
                          setIsEditingExp(false);
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveExp} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Job Role / Designation</label>
                        <input
                          type="text"
                          required
                          value={expForm.role}
                          onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                          placeholder="e.g. Senior Full Stack Engineer"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Company / Institution Name</label>
                        <input
                          type="text"
                          required
                          value={expForm.company}
                          onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                          placeholder="e.g. Google AI Studio, IIT Bombay"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={expForm.location}
                          onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                          placeholder="e.g. Remote, Patna, India"
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Employment Type</label>
                          <select
                            value={expForm.type}
                            onChange={(e) => setExpForm({ ...expForm, type: e.target.value as JobType })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          >
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Work Period</label>
                          <input
                            type="text"
                            required
                            value={expForm.duration}
                            onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                            placeholder="e.g. Jul 2026 - Present"
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                        Roles & Core Achievements (One per line)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={expForm.bulletsText}
                        onChange={(e) => setExpForm({ ...expForm, bulletsText: e.target.value })}
                        placeholder="e.g. Collaborated with cross-functional teams to coordinate online events&#10;Developed robust routing security in core layouts"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white font-sans"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
                      >
                        {expForm.id ? 'Save Updates' : 'Add Experience Card'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Experience List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Current Positions</h3>
                  <div className="space-y-3">
                    {data.experiences.map((exp) => (
                      <div key={exp.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-between items-start shadow-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{exp.role}</h4>
                            <span className="px-2 py-0.5 text-4xs font-bold uppercase tracking-wider rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                              {exp.type}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {exp.company} &bull; {exp.location}
                          </p>
                          <p className="text-3xs text-zinc-400 mt-1 font-semibold">{exp.duration}</p>
                        </div>

                        <div className="flex gap-1.5 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEditExpClick(exp)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition"
                            title="Edit experience"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExp(exp.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition"
                            title="Delete experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 4. Education & Certifications Panel */}
            {activeTab === 'education' && (
              <div className="space-y-8">
                
                {/* Education section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Education Form */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        {eduForm.id ? 'Edit Education Entry' : 'Add Education History'}
                      </h2>
                    </div>

                    <form onSubmit={handleSaveEdu} className="space-y-3">
                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Degree Title</label>
                        <input
                          type="text"
                          required
                          value={eduForm.degree}
                          onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                          placeholder="e.g. Master of Computer Applications (MCA)"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Institution</label>
                        <input
                          type="text"
                          required
                          value={eduForm.institution}
                          onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                          placeholder="e.g. Patna University"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Location</label>
                          <input
                            type="text"
                            required
                            value={eduForm.location}
                            onChange={(e) => setEduForm({ ...eduForm, location: e.target.value })}
                            placeholder="Patna, India"
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Period</label>
                          <input
                            type="text"
                            required
                            value={eduForm.duration}
                            onChange={(e) => setEduForm({ ...eduForm, duration: e.target.value })}
                            placeholder="2024 - 2026"
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Score / Grade</label>
                        <input
                          type="text"
                          required
                          value={eduForm.score}
                          onChange={(e) => setEduForm({ ...eduForm, score: e.target.value })}
                          placeholder="e.g. CGPA: 8.59 or 73.75%"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        {eduForm.id && (
                          <button
                            type="button"
                            onClick={() => setEduForm({ degree: '', institution: '', location: '', duration: '', score: '' })}
                            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                        >
                          {eduForm.id ? 'Save Changes' : 'Add Education'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Education List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Education Entries</h3>
                    {data.educations.map(edu => (
                      <div key={edu.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-between items-start shadow-xs">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white leading-snug">{edu.degree}</h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{edu.institution} &bull; {edu.location}</p>
                          <p className="text-3xs text-zinc-400 mt-1 font-medium">{edu.duration} | <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{edu.score}</span></p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditEduClick(edu)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition cursor-pointer"
                            title="Edit education entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEdu(edu.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 transition cursor-pointer"
                            title="Delete education entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>

                {/* Certifications section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Certificate Form */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        {certForm.id ? 'Edit Professional Certificate' : 'Add Professional Certificate'}
                      </h2>
                    </div>

                    <form onSubmit={handleSaveCert} className="space-y-3">
                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Certification Name</label>
                        <input
                          type="text"
                          required
                          value={certForm.name}
                          onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                          placeholder="e.g. AWS Certified Developer"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Issuer Name</label>
                          <input
                            type="text"
                            required
                            value={certForm.issuer}
                            onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                            placeholder="Infosys, Oracle"
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Year</label>
                          <input
                            type="text"
                            required
                            value={certForm.year}
                            onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                            placeholder="2025"
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Credential URL (Optional)</label>
                        <input
                          type="url"
                          value={certForm.url}
                          onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
                          placeholder="e.g. https://domain.com/certificate/123"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        {certForm.id && (
                          <button
                            type="button"
                            onClick={() => setCertForm({ name: '', issuer: '', year: '', url: '' })}
                            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                        >
                          {certForm.id ? 'Save Changes' : 'Add Certification'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Certificates List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Certifications</h3>
                    {data.certifications.map(c => (
                      <div key={c.id} className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-between items-center shadow-xs">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white leading-tight truncate">{c.name}</h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {c.issuer} &bull; <span className="font-semibold">{c.year}</span>
                          </p>
                          {c.url && (
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                              Has URL: <span className="underline">{c.url}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-3">
                          <button
                            type="button"
                            onClick={() => handleEditCertClick(c)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 transition cursor-pointer"
                            title="Edit certification"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCert(c.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 transition cursor-pointer"
                            title="Delete certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* 6. Skills & Sections Panel */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                
                {/* Section 1 & 2: Add Skill & Manage Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        {skillForm.id ? 'Edit Skill' : 'Add New Skill'}
                      </h2>
                    </div>

                    <form onSubmit={handleSaveSkill} className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Skill Section / Category
                          </label>
                          {uniqueCategories.length > 0 && (
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryMode('select');
                                  if (uniqueCategories.length > 0) {
                                    setSkillForm(prev => ({ ...prev, category: uniqueCategories[0] }));
                                  }
                                }}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                                  categoryMode === 'select'
                                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-3xs'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                              >
                                Choose Existing
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryMode('new');
                                  setSkillForm(prev => ({ ...prev, category: '' }));
                                }}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                                  categoryMode === 'new'
                                    ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-3xs'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                              >
                                Create New
                              </button>
                            </div>
                          )}
                        </div>

                        {categoryMode === 'select' && uniqueCategories.length > 0 ? (
                          <select
                            required
                            value={skillForm.category}
                            onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white cursor-pointer"
                          >
                            <option value="" disabled>-- Select Existing Section --</option>
                            {uniqueCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            value={skillForm.category}
                            onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                            placeholder="e.g. Frontend, Databases, Languages..."
                            className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                          />
                        )}
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                          {categoryMode === 'select' && uniqueCategories.length > 0 
                            ? "Assign the skill to one of your current portfolio sections."
                            : "Create a brand new section/category for your skills list."}
                        </p>
                      </div>

                      <div>
                        <label className="block text-2xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          required
                          value={skillForm.name}
                          onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                          placeholder="e.g. React.js, Python, AWS"
                          className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        {skillForm.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setSkillForm({ category: '', name: '' });
                              setIsEditingSkill(false);
                            }}
                            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                        >
                          {skillForm.id ? 'Save Changes' : 'Add Skill'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Section 2: Manage Sections */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        Manage Skill Sections
                      </h2>
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {uniqueCategories.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-6">No sections yet.</p>
                      ) : (
                        uniqueCategories.map(cat => {
                          const count = data.skills.filter(s => s.category === cat).length;
                          return (
                            <div key={cat} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/40 dark:border-zinc-805 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{cat} <span className="text-2xs font-normal text-zinc-400">({count} skills)</span></span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1 text-zinc-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                                  title="Delete entire section and its skills"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="New name..."
                                  id={`rename-cat-${cat}`}
                                  className="flex-1 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-2xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`rename-cat-${cat}`) as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      handleRenameCategory(cat, input.value.trim());
                                      input.value = '';
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-2xs font-semibold rounded-lg transition cursor-pointer"
                                >
                                  Rename
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Grouped Skills List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">All Skills Grouped by Section</h3>
                  {uniqueCategories.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <p className="text-xs text-zinc-400">No skills currently available. Add some skills above!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uniqueCategories.map(cat => {
                        const catSkills = data.skills.filter(s => s.category === cat);
                        return (
                          <div key={cat} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-3xs">
                            <h4 className="text-2xs font-bold text-zinc-400 uppercase tracking-wider mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">{cat}</h4>
                            <div className="flex flex-wrap gap-2">
                              {catSkills.map(skill => (
                                <div 
                                  key={skill.id} 
                                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-lg group/item hover:border-emerald-500/20"
                                >
                                  <span className="text-2xs font-semibold text-zinc-700 dark:text-zinc-300">{skill.name}</span>
                                  <div className="flex gap-0.5 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleEditSkillClick(skill)}
                                      className="p-0.5 text-zinc-400 hover:text-emerald-500 cursor-pointer"
                                      title="Edit skill name"
                                    >
                                      <Edit3 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSkill(skill.id)}
                                      className="p-0.5 text-zinc-400 hover:text-red-500 cursor-pointer"
                                      title="Delete skill"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 5. Messages Panel */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Visitor Inquiries</h2>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-150 dark:border-zinc-800 rounded-lg">
                      Total: {messages.length} inquiries
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Your inbox is completely clear!</p>
                      <p className="text-xs text-zinc-400 mt-1">Messages sent through the portfolio form will appear here instantly.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-5 rounded-2xl border transition-all ${
                            msg.read 
                              ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800' 
                              : 'bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-200/50 dark:border-emerald-900/30 ring-1 ring-emerald-500/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-900 dark:text-white">{msg.name}</span>
                                {!msg.read && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white rounded">
                                    New
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">{msg.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xs text-zinc-400 dark:text-zinc-500 font-mono font-medium">{msg.timestamp}</span>
                              <div className="flex items-center gap-1.5">
                                {!msg.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(msg.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950 rounded-lg transition"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl p-3.5">
                            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">Subject: {msg.subject}</h5>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="flex border-t border-zinc-150 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 border-r border-zinc-150 dark:border-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
