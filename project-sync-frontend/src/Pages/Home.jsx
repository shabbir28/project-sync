import { Link } from 'react-router-dom';
import { useAuth } from '../Services/authContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../Components/Navbar';
import { useEffect } from 'react';
import heroImg from '../assets/hero-img.png';
import aboutImg from '../assets/about.png';
import { FiMail, FiPhone } from 'react-icons/fi';

// Add custom keyframes for floating animation
const floatAnimation = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-24px); }
    100% { transform: translateY(0px); }
  }
`;

const aboutFloatAnim = `
  @keyframes aboutFloat {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-18px) scale(1.04); }
    100% { transform: translateY(0) scale(1); }
  }
`;

const aboutBgAnim = `
  @keyframes parallaxMove {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 100%; }
  }
`;

const Footer = () => (
  <footer className="w-full bg-gradient-to-r from-indigo-800 to-purple-800 text-white py-8 mt-16">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="font-bold text-lg">Project Sync</div>
      <div className="flex gap-6 text-sm">
        <Link to="/" className="hover:underline hover:text-pink-200 transition">Home</Link>
        <Link to="/about" className="hover:underline hover:text-pink-200 transition">About</Link>
        <Link to="/contact" className="hover:underline hover:text-pink-200 transition">Contact</Link>
      </div>
      <div className="text-xs text-blue-100">&copy; {new Date().getFullYear()} Project Sync. All rights reserved.</div>
    </div>
  </footer>
);

const GetInTouch = () => (
  <section className="w-full flex flex-col items-center py-16 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden">
    <div className="absolute left-10 top-10 w-40 h-40 bg-pink-300 opacity-20 rounded-full blur-2xl" style={{ animation: 'aboutFloat 8s ease-in-out infinite' }} />
    <div className="absolute right-10 bottom-10 w-32 h-32 bg-indigo-400 opacity-10 rounded-full blur-2xl" style={{ animation: 'aboutFloat 10s ease-in-out infinite', animationDelay: '1.5s' }} />
    <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">
      <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">Get in Touch</h2>
      <p className="text-gray-700 mb-6">We'd love to hear from you! Reach out for questions, feedback, or partnership opportunities.</p>
      <div className="flex flex-col sm:flex-row gap-6 mb-6 w-full justify-center">
        <a href="mailto:support@projectsync.com" className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition text-indigo-800 font-semibold"><FiMail className="w-5 h-5" /> support@projectsync.com</a>
        <a href="tel:+1234567890" className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition text-indigo-800 font-semibold"><FiPhone className="w-5 h-5" /> +1 (234) 567-890</a>
      </div>
      <Link to="/contact" className="inline-block mt-2 px-8 py-3 bg-gradient-to-r from-indigo-800 to-purple-800 text-white rounded font-semibold hover:from-indigo-900 hover:to-purple-900 transition shadow-lg">Contact Us</Link>
    </div>
  </section>
);

const Home = () => {
  const { isLoggedIn, userRole } = useAuth();
  const { scrollYProgress } = useScroll();

  // Parallax effect for hero image
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (userRole === 'manager') {
      return '/manager/dashboard';
    } else if (userRole === 'developer') {
      return '/developer/dashboard';
    }
    // Fallback, should not happen
    return '/login';
  };

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.8,
      rotateX: -20
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.5
      }
    }
  };

  return (
    <div className="bg-gradient-to-tr from-indigo-50 via-purple-50 to-white min-h-screen flex flex-col">
      <style>{floatAnimation + aboutFloatAnim + aboutBgAnim}</style>
      <Navbar />
      {/* Hero section with enhanced animations */}
      <motion.section 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="relative flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-20 gap-10"
      >
        <motion.div 
          variants={itemVariants}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow">Project Sync</h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl"
          >
            Simplify project management for small teams and startups with our streamlined collaboration platform.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start"
          >
                  {isLoggedIn ? (
                      <Link
                        to={getDashboardUrl()}
                className="rounded-md bg-gradient-to-r from-indigo-800 to-purple-800 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-indigo-900 hover:to-purple-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800 transition-all duration-200"
                      >
                        Go to Dashboard
                      </Link>
                  ) : (
                    <>
                        <Link
                          to="/signup"
                  className="rounded-md bg-gradient-to-r from-indigo-800 to-purple-800 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:from-indigo-900 hover:to-purple-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800 transition-all duration-200"
                        >
                  Get started
                        </Link>
                        <Link
                          to="/login"
                  className="rounded-md border border-indigo-800 px-6 py-3 text-lg font-semibold text-indigo-800 bg-white shadow hover:bg-indigo-50 transition-all duration-200"
                        >
                  Login
                        </Link>
                    </>
                  )}
          </motion.div>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          style={{ y }}
          className="flex-1 flex justify-center items-center mb-8 md:mb-0"
        >
          <img
            src={heroImg}
            alt="Project Sync Hero"
            className="w-full max-w-md md:max-w-lg rounded-3xl shadow-2xl object-cover animate-fade-in"
            style={{ aspectRatio: '1.2/1', animation: 'float 3.5s ease-in-out infinite' }}
          />
        </motion.div>
        {/* Decorative Gradient Blobs */}
        <div className="absolute -z-10 left-0 top-0 w-72 h-72 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -z-10 right-0 bottom-0 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl animate-pulse-slow" />
      </motion.section>

      {/* Features section with enhanced animations */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="py-24 sm:py-32 bg-white/70 backdrop-blur rounded-3xl shadow-xl mx-4 my-8"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            variants={itemVariants}
            className="mx-auto max-w-2xl lg:text-center"
          >
            <h2 className="text-base font-semibold leading-7 text-indigo-800">Efficient Project Management</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Designed for small teams with big ambitions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Project Sync provides a lightweight but powerful platform for managing projects without complex hierarchies or overwhelming features.
            </p>
          </motion.div>
          <motion.div 
            variants={containerVariants}
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                {
                  title: "Project Tracking",
                  description: "Create and track projects with real-time updates, milestones, and deadlines.",
                  icon: "M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                },
                {
                  title: "Team Collaboration",
                  description: "Managers and developers work together seamlessly with role-based permissions and workflows.",
                  icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                },
                {
                  title: "Progress Insights",
                  description: "Get clear insights into project progress, team performance, and upcoming deadlines.",
                  icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                },
                {
                  title: "Simple & Secure",
                  description: "Designed to be intuitive and secure, with role-based access control and data protection.",
                  icon: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative pl-16 group hover:scale-105 transition-transform"
                >
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-800 to-purple-800 group-hover:from-indigo-900 group-hover:to-purple-900 transition">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                    </svg>
                  </div>
                    {feature.title}
                </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">
                    {feature.description}
                </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>
        </div>
      </motion.div>

      {/* About Preview Section with enhanced animations */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="relative w-full flex flex-col md:flex-row items-center justify-center gap-10 py-16 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(120deg, #e0f2fe 0%, #dbeafe 100%)',
          backgroundAttachment: 'fixed',
          animation: 'parallaxMove 30s linear infinite',
          backgroundSize: '200% 200%',
        }}
      >
        <motion.div 
          variants={itemVariants}
          className="flex-1 flex justify-center items-center mb-8 md:mb-0"
        >
          <img
            src={aboutImg}
            alt="About Project Sync"
            className="w-full max-w-xs md:max-w-sm rounded-2xl shadow-xl object-cover"
            style={{ animation: 'aboutFloat 4.5s ease-in-out infinite' }}
          />
        </motion.div>
        <motion.div 
          variants={itemVariants}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left"
        >
          <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">About Project Sync</h2>
          <p className="max-w-xl text-lg text-gray-700 mb-4">
            Project Sync is a modern project management platform designed for small teams and startups. Our mission is to simplify collaboration, streamline workflows, and help teams achieve their goals efficiently.
          </p>
          <Link to="/about" className="inline-block mt-2 px-6 py-2 bg-gradient-to-r from-indigo-800 to-purple-800 text-white rounded font-semibold hover:from-indigo-900 hover:to-purple-900 transition">Learn more</Link>
        </motion.div>
      </motion.section>

      {/* Get in Touch Section */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        <GetInTouch />
      </motion.div>

      <Footer />
    </div>
  );
};

export default Home; 