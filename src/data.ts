import { PortfolioData } from './types';

export const defaultPortfolioData: PortfolioData = {
  profile: {
    name: 'Priyewrat',
    title: 'Full Stack Developer & AI Engineer',
    email: 'priyewratsingh@gmail.com',
    phone: '(+91) 9608155534',
    location: 'Patna, Bihar',
    linkedin: 'https://linkedin.com/in/priyewrat',
    github: 'https://github.com/priyewrat',
    summary: 'Results-driven Full Stack Developer and MCA graduate with proven expertise in architecting and deploying AI-powered web applications utilizing React, Node.js, Flask, FastAPI, and AWS cloud infrastructure. Proficient in crafting responsive frontends using Tailwind CSS and engineering scalable RESTful backends. Certified AWS Developer Associate adept at leveraging Docker, Kubernetes, and CI/CD pipelines to streamline production deployment. Passionate about integrating AI and modern web technologies to deliver high-performance solutions.',
    avatarUrl: 'https://avatars.githubusercontent.com/u/165651975?v=4'
  },
  skills: [
    // Languages
    { id: 'l1', category: 'Languages', name: 'JavaScript' },
    { id: 'l2', category: 'Languages', name: 'TypeScript' },
    { id: 'l3', category: 'Languages', name: 'Java' },
    { id: 'l4', category: 'Languages', name: 'Python' },
    { id: 'l5', category: 'Languages', name: 'SQL' },
    
    // Backend
    { id: 'b1', category: 'Backend', name: 'Express.js' },
    { id: 'b2', category: 'Backend', name: 'FastAPI' },
    { id: 'b3', category: 'Backend', name: 'Flask' },
    { id: 'b4', category: 'Backend', name: 'Spring Boot' },
    { id: 'b5', category: 'Backend', name: 'REST API Design' },
    
    // Frontend
    { id: 'f1', category: 'Frontend', name: 'HTML' },
    { id: 'f2', category: 'Frontend', name: 'CSS' },
    { id: 'f3', category: 'Frontend', name: 'Tailwind CSS' },
    { id: 'f4', category: 'Frontend', name: 'React.js' },
    { id: 'f5', category: 'Frontend', name: 'Next.js' },
    { id: 'f6', category: 'Frontend', name: 'Redux' },
    { id: 'f7', category: 'Frontend', name: 'Responsive Design' },
    
    // Databases
    { id: 'd1', category: 'Databases', name: 'MongoDB' },
    { id: 'd2', category: 'Databases', name: 'MySQL' },
    { id: 'd3', category: 'Databases', name: 'PostgreSQL' },
    { id: 'd4', category: 'Databases', name: 'SQL Server' },
    { id: 'd5', category: 'Databases', name: 'Firebase' },
    
    // DevOps / Cloud
    { id: 'dv1', category: 'DevOps / Cloud', name: 'AWS (EC2, S3)' },
    { id: 'dv2', category: 'DevOps / Cloud', name: 'Docker' },
    { id: 'dv3', category: 'DevOps / Cloud', name: 'Kubernetes' },
    { id: 'dv4', category: 'DevOps / Cloud', name: 'Git' },
    { id: 'dv5', category: 'DevOps / Cloud', name: 'GitHub Actions (CI/CD)' },
    
    // Testing
    { id: 't1', category: 'Testing', name: 'Postman' },
    { id: 't2', category: 'Testing', name: 'Thunder Client' },
    { id: 't3', category: 'Testing', name: 'API Testing' },
    { id: 't4', category: 'Testing', name: 'Playwright' }
  ],
  experiences: [
    {
      id: 'exp1',
      role: 'Campus Ambassador Intern',
      company: 'E-Cell, IIT Bombay (Remote)',
      location: 'Remote',
      type: 'Internship',
      duration: 'Jul 2026 - Present',
      bullets: [
        'Spearheading regional outreach and student engagement initiatives to promote entrepreneurship ecosystems and E-Cell initiatives.',
        'Collaborating with cross-functional teams to coordinate online bootcamps, hackathons, and tech-entrepreneurship webinars.'
      ]
    },
    {
      id: 'exp2',
      role: 'Backend Developer - Academic Project',
      company: 'NIT Patna',
      location: 'Patna, India',
      type: 'Full Time',
      duration: 'Apr 2026 - Present',
      bullets: [
        'Engineered high-performance backend services using FastAPI, decreasing API response latency by 40%.',
        'Integrated DeepFace, TensorFlow, NumPy, and OpenCV to achieve a 98.5% accuracy rate in real-time face detection.',
        'Designed a scalable MongoDB storage schema for facial embeddings, ensuring secure identity management with sub-second retrieval.',
        'Exposed robust REST endpoints to a React frontend, facilitating seamless and secure face verification workflows.'
      ]
    },
    {
      id: 'exp3',
      role: 'Full Stack Development Intern',
      company: 'Beltron, Patna',
      location: 'Patna, India',
      type: 'Internship',
      duration: 'May 2026 - Jun 2026',
      bullets: [
        'Architected robust conditional routing guards in React.js to cleanly isolate 7 distinct administrative roles from citizen access levels.',
        'Developed modular, reusable frontend UI components, significantly boosting code maintainability and user workflows.',
        'Built performant RESTful APIs using Spring Boot and structured relational database schemas in PostgreSQL to handle high-volume daily queries.',
        'Delivered scalable end-to-end features, contributing to a 99.9% system uptime during internal validation stages.'
      ]
    },
    {
      id: 'exp4',
      role: 'AI Intern',
      company: 'Infosys Springboard',
      location: 'Remote',
      type: 'Internship',
      duration: 'Dec 2025 - Mar 2026',
      bullets: [
        'Formulated an LLM-driven testing agent using LangChain, Playwright, and Streamlit, decreasing manual QA efforts by 50%.',
        'Devised resilient error-recovery mechanisms and automated HTML test report generation, boosting pipeline reliability by 35%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj1',
      title: 'AI Agent for Automated Website Testing (NLP)',
      description: 'An AI-powered automated testing suite that translates natural language instructions into concrete web interactions and end-to-end browser tests.',
      technologies: ['LangChain', 'Playwright', 'Streamlit', 'Python', 'LLM Integration'],
      duration: 'Dec 2025 - Mar 2026',
      bullets: [
        'Constructed an AI automated testing suite translating natural language inputs into functional browser actions using Streamlit and Playwright.',
        'Implemented dynamic UI selector strategies and robust exception handling, reducing unexpected test script failures by 25%.'
      ]
    },
    {
      id: 'proj2',
      title: 'Real-Time Face Recognition System',
      description: 'A high-performance backend architecture designed for low-latency video stream processing and identity authentication using deep learning facial embeddings.',
      technologies: ['FastAPI', 'TensorFlow', 'OpenCV', 'NumPy', 'MongoDB', 'React.js'],
      duration: 'Apr 2026 - Present',
      bullets: [
        'Developed a robust computer vision backend utilizing FastAPI, TensorFlow, and OpenCV to process high-throughput video streams.',
        'Optimized database lookup operations to seamlessly support over 50 concurrent facial verification requests.'
      ]
    },
    {
      id: 'proj3',
      title: 'Upchaar – Doctor Appointment Booking System',
      description: 'A comprehensive, role-based medical consulting and appointment scheduling platform tailored for seamless hospital and patient management workflows.',
      technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JWT', 'Tailwind CSS', 'Cloudinary'],
      duration: 'Apr 2025 - Jul 2025',
      bullets: [
        'Built a comprehensive MERN-stack application featuring fine-grained, role-based authentication using JWT tokens.',
        'Integrated third-party APIs for scheduling and Cloudinary for media assets, wrapped in a highly responsive Tailwind CSS UI.',
        'Accelerated appointment scheduling efficiency by 35% compared to legacy manual or spreadsheet workflows.'
      ]
    }
  ],
  educations: [
    {
      id: 'edu1',
      degree: 'Master of Computer Applications (MCA)',
      institution: 'Patna University',
      location: 'Patna, India',
      duration: '2024 - 2026',
      score: 'CGPA: 8.59'
    },
    {
      id: 'edu2',
      degree: 'Bachelor of Science in Information Technology (B.Sc-IT)',
      institution: 'Patliputra University',
      location: 'Patna, India',
      duration: '2021 - 2024',
      score: 'Percentage: 73.75%'
    }
  ],
  certifications: [
    {
      id: 'cert1',
      name: 'AWS Certified Developer – Associate',
      issuer: 'Infosys Springboard',
      year: '2025'
    },
    {
      id: 'cert2',
      name: 'Oracle Cloud Infrastructure Generative AI Professional',
      issuer: 'Oracle University',
      year: '2025'
    },
    {
      id: 'cert3',
      name: 'Artificial Intelligence & Machine Learning Certification',
      issuer: 'IBM SkillsBuild',
      year: '2025'
    },
    {
      id: 'cert4',
      name: 'National Level Online Python Assessment (Scored 96%)',
      issuer: 'K.R. College of Arts and Science',
      year: '2025',
      url: 'https://github.com/priyewrat'
    }
  ]
};
