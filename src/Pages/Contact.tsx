import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../lib/toast';
import { inquiriesAPI } from '../services/api';
import { ChevronDown, Check } from 'lucide-react';
import backgroundImage from '../assets/image/background/Offers-section.jpeg';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Booking' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'billing', label: 'Billing' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'feedback', label: 'Feedback' }
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(option => option.value === value)?.label || 'Select a category';
  };

  const getPriorityLabel = (value: string) => {
    return priorityOptions.find(option => option.value === value)?.label || 'Select priority';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.guest_name || !formData.guest_email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await inquiriesAPI.create(formData);
      toast.success('Your inquiry has been submitted successfully! We will get back to you soon.');
      setFormData({
        guest_name: '',
        guest_email: '',
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-48 pt-32">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#001F3F]/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-8 text-center">Contact Us</h1>
          <p className="text-white text-base md:text-lg text-center max-w-2xl">
            Have a question or need assistance? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700 mb-3">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      id="guest_name"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full h-10 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guest_email" className="block text-sm font-medium text-gray-700 mb-3">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      id="guest_email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full h-10 px-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="relative" ref={categoryRef}>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      aria-haspopup="listbox"
                      aria-expanded={isCategoryOpen}
                    >
                      <span className="text-gray-900">{getCategoryLabel(formData.category)}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isCategoryOpen && (
                      <div
                        className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                        role="listbox"
                      >
                        {categoryOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleSelectChange('category', option.value);
                              setIsCategoryOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center justify-between transition-colors"
                            role="option"
                            aria-selected={formData.category === option.value}
                          >
                            <span className="text-gray-900">{option.label}</span>
                            {formData.category === option.value && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-3">
                    Priority
                  </label>
                  <div className="relative" ref={priorityRef}>
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      aria-haspopup="listbox"
                      aria-expanded={isPriorityOpen}
                    >
                      <span className="text-gray-900">{getPriorityLabel(formData.priority)}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isPriorityOpen && (
                      <div
                        className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-40 max-h-48 overflow-y-auto"
                        role="listbox"
                      >
                        {priorityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleSelectChange('priority', option.value);
                              setIsPriorityOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center justify-between transition-colors"
                            role="option"
                            aria-selected={formData.priority === option.value}
                          >
                            <span className="text-gray-900">{option.label}</span>
                            {formData.priority === option.value && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-3">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your inquiry"
                    className="w-full h-10 px-3"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-3">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide details about your inquiry..."
                    className="w-full min-h-32 px-3 py-2 resize-none"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0F51AF] hover:bg-[#0d4291] text-white py-2.5 h-11 px-4"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F51AF] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Phone</h3>
                      <p className="text-gray-600 text-sm">+27 79 946 7887</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F51AF] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Email</h3>
                      <p className="text-gray-600 text-sm">info@codetribehotel.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0F51AF] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Address</h3>
                      <p className="text-gray-600 text-sm">123 Pretorious St, Pretoria</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900">Response Time</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 text-sm font-medium">Urgent</span>
                    <span className="font-semibold text-red-600 text-sm">Within 2 hours</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 text-sm font-medium">High Priority</span>
                    <span className="font-semibold text-orange-600 text-sm">Within 4 hours</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 text-sm font-medium">Medium Priority</span>
                    <span className="font-semibold text-yellow-600 text-sm">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 text-sm font-medium">Low Priority</span>
                    <span className="font-semibold text-green-600 text-sm">Within 48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
