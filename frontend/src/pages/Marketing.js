import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Marketing.css';
import Features from '../components/marketing/Features';
import SuccessStories from '../components/marketing/SuccessStories';
import Pricing from '../components/marketing/Pricing';
import Testimonials from '../components/marketing/Testimonials';
import FAQ from '../components/marketing/FAQ';

const Marketing = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleDemoClick = () => {
        navigate('/demo/dashboard');
    };

    return (
        <div className="font-sans antialiased text-gray-900 bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <img src="/images/logo.png" alt="CloudCostIQ" className="h-8" />
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a href="#features" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Features
                                </a>
                                <a href="#success-stories" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Success Stories
                                </a>
                                <a href="#pricing" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Pricing
                                </a>
                                <a href="#testimonials" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Testimonials
                                </a>
                                <a href="#faq" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    FAQ
                                </a>
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center">
                            <button onClick={handleDemoClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">
                                Demo
                            </button>
                            <button onClick={handleGetStarted} className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="gradient-bg">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                                <span className="block">Optimize Your</span>
                                <span className="block">Cloud Costs with AI</span>
                            </h1>
                            <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                                CloudCostIQ helps you monitor, analyze, and optimize cloud spending across AWS, Azure, and GCP in one unified platform.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleGetStarted} className="cta-btn inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out">
                                    Start Free Trial
                                </button>
                                <button onClick={handleDemoClick} className="cta-btn inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-500 transition duration-150 ease-in-out">
                                    Watch Demo <span className="ml-2">▶</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-12 lg:mt-0 flex justify-center">
                            <img className="rounded-lg shadow-xl transform rotate-2" src="/images/dashboard.png" alt="Dashboard Screenshot" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-base font-semibold uppercase text-gray-500 tracking-wide">
                        Supported cloud providers
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-3">
                        <div className="col-span-1 flex justify-center">
                            <img className="provider-logo h-12" src="/images/aws-logo.png" alt="AWS" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <img className="provider-logo h-12" src="/images/azure-logo.png" alt="Azure" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <img className="provider-logo h-12" src="/images/gcp-logo.png" alt="Google Cloud" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <Features />
            <SuccessStories />
            <Pricing />
            <Testimonials />
            <FAQ />

            {/* CTA Section */}
            <div className="bg-indigo-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">Ready to reduce your cloud costs?</span>
                        <span className="block text-indigo-200">Start your free trial today.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <button onClick={handleGetStarted} className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                                Get started
                            </button>
                        </div>
                        <div className="ml-3 inline-flex rounded-md shadow">
                            <button onClick={handleDemoClick} className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#features" className="text-base text-gray-300 hover:text-white">Features</a></li>
                                <li><a href="#pricing" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                                <li><a href="#demo" className="text-base text-gray-300 hover:text-white">Demo</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#about" className="text-base text-gray-300 hover:text-white">About</a></li>
                                <li><a href="#testimonials" className="text-base text-gray-300 hover:text-white">Testimonials</a></li>
                                <li><a href="#contact" className="text-base text-gray-300 hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#docs" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                                <li><a href="#blog" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                                <li><a href="#support" className="text-base text-gray-300 hover:text-white">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="#privacy" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                                <li><a href="#terms" className="text-base text-gray-300 hover:text-white">Terms</a></li>
                                <li><a href="#security" className="text-base text-gray-300 hover:text-white">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-800 pt-8">
                        <p className="text-base text-gray-400 xl:text-center">
                            &copy; 2024 CloudCostIQ. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Marketing; 