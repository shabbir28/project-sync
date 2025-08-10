import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import Navbar from '../Components/Navbar';

const animatedBg = `
  @keyframes moveCircle1 {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(40px, -30px) scale(1.1); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes moveCircle2 {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-50px, 30px) scale(1.08); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes moveCircle3 {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, 40px) scale(1.12); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes moveCircle4 {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-30px, -40px) scale(1.07); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes popup {
    0% { opacity: 0; transform: scale(0.8) translateY(40px); }
    80% { opacity: 1; transform: scale(1.05) translateY(-8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

export const ContactPreview = () => (
  <section className="w-full flex flex-col items-center py-12 px-4" id="contact-preview">
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center text-center">
      <h2 className="text-3xl font-bold text-indigo-800 mb-2">Get in Touch</h2>
      <p className="text-gray-600 mb-4">Have questions or want to work with us? We're here to help!</p>
      <div className="mb-4">
        <p className="text-gray-700"><span className="font-semibold">Email:</span> <a href="mailto:support@projectsync.com" className="text-indigo-800 underline">support@projectsync.com</a></p>
        <p className="text-gray-700"><span className="font-semibold">Phone:</span> <a href="tel:+1234567890" className="text-indigo-800 underline">+1 (234) 567-890</a></p>
      </div>
      <a href="/contact" className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-800 to-purple-800 text-white rounded font-semibold hover:from-indigo-900 hover:to-purple-900 transition">Contact Us</a>
    </div>
  </section>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
      scale: 0.8
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen">
      <style>{animatedBg}</style>
      <Navbar />
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="relative min-h-screen py-20 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-800/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-800/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-16">
          <motion.div 
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Contact Us</h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Have questions or want to learn more? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Information */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <FiMail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Email</h4>
                    <a href="mailto:support@projectsync.com" className="text-white/80 hover:text-white transition text-sm">
                      shabbirahmed.devv@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <FiPhone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Phone</h4>
                    <a href="tel:+1234567890" className="text-white/80 hover:text-white transition text-sm">
                      +92-319022513-6
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <FiMapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Location</h4>
                    <p className="text-white/80 text-sm">123 Innovation Drive, Tech City, TC 12345</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-white mb-4">Send us a Message</h3>
              
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center"
                >
                  <h4 className="text-lg font-semibold text-white mb-1">Message Sent!</h4>
                  <p className="text-white/80 text-sm">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition text-sm"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-white/80 mb-1 text-sm">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition text-sm"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white/80 mb-1 text-sm">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white/80 mb-1 text-sm">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition text-sm"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white/80 mb-1 text-sm">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-800 focus:border-transparent transition text-sm"
                      placeholder="Your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-800 to-purple-800 text-white font-semibold py-2 rounded-lg hover:from-indigo-900 hover:to-purple-900 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact; 