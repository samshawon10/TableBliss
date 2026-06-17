

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { contactAPI } from '../services/api';
import Swal from 'sweetalert2';
import { HiMail, HiPhone, HiLocationMarker, HiClock } from 'react-icons/hi';

const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await contactAPI.submit(data);
      Swal.fire({ icon: 'success', title: 'Message sent!', text: 'We will get back to you soon.' });
      reset();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to send message' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3">We'd love to hear from you</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Your name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" {...register('email', { required: 'Email is required' })} className="input-field" placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject</label>
                  <input type="text" {...register('subject', { required: 'Subject is required' })} className="input-field" placeholder="How can we help?" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message</label>
                  <textarea {...register('message', { required: 'Message is required' })} className="input-field" rows="5" placeholder="Your message..." />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Sending...' : 'Send Message'}</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <HiLocationMarker className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Address</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">House 15, Road 2
Notun Bazar, Badda, Dhaka 1212, Bangladesh</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <HiPhone className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Phone</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">+880 1712-345678</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <HiMail className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">hello@tablebliss.com</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <HiClock className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Hours</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri: 9AM - 6PM</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sat: 10AM - 4PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;