import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiShield, FiTrendingUp } from 'react-icons/fi';
import aboutImage from '../assets/about.png';
import Navbar from '../Components/Navbar';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotateY: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.5,
        delay: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <motion.div
          className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
          animate="visible"
      variants={containerVariants}
        >
          {/* Hero Section */}
        <motion.div 
            className="text-center mb-16"
          variants={itemVariants}
        >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              About Project Sync
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering teams to achieve more through innovative project management solutions
          </p>
        </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div 
            variants={imageVariants}
            className="relative"
          >
            <div className="relative">
                <img
                src={aboutImage}
                alt="About Project Sync"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl -z-10 blur-xl opacity-30" />
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="space-y-8"
          >
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To revolutionize project management by providing intuitive tools that enhance team collaboration and productivity.
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To be the leading platform for small teams and startups, enabling them to achieve their goals with clarity and confidence.
                </p>
              </motion.div>
            </motion.div>
                </div>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Team Focused</h4>
              <p className="text-gray-600">Built for seamless collaboration and communication between team members.</p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg"
              >
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <FiTarget className="w-6 h-6 text-blue-600" />
                </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Goal Oriented</h4>
              <p className="text-gray-600">Clear objectives and milestones to keep your projects on track.</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <FiShield className="w-6 h-6 text-blue-600" />
                </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure</h4>
              <p className="text-gray-600">Enterprise-grade security and data protection for your peace of mind.</p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg"
              >
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Growth</h4>
              <p className="text-gray-600">Scalable solutions that grow with your team and organization.</p>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
            <div className="flex justify-center gap-4">
              <a
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 