import React from 'react';

const FAQ = () => {
    const faqs = [
        {
            question: 'How does CloudCostIQ work?',
            answer: 'CloudCostIQ connects to your cloud providers through secure APIs, analyzes your usage patterns, and provides real-time insights and recommendations for cost optimization.'
        },
        {
            question: 'Which cloud providers do you support?',
            answer: 'We currently support AWS, Microsoft Azure, and Google Cloud Platform. We\'re constantly adding support for more providers based on customer demand.'
        },
        {
            question: 'Is my data secure?',
            answer: 'Yes, security is our top priority. We use industry-standard encryption, secure API connections, and never store your cloud credentials. All data is encrypted at rest and in transit.'
        },
        {
            question: 'How long does it take to see results?',
            answer: 'Most customers see their first cost-saving opportunities within 24 hours of connecting their cloud accounts. The AI continues to learn and improve recommendations over time.'
        },
        {
            question: 'Do you offer a free trial?',
            answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card required to start.'
        }
    ];

    return (
        <div id="faq" className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">FAQ</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Frequently Asked Questions</p>
                </div>
                <div className="mt-12 max-w-3xl mx-auto">
                    <div className="space-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index}>
                                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                <p className="mt-2 text-base text-gray-500">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ; 