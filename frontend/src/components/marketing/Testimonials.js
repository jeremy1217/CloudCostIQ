import React from 'react';

const Testimonials = () => {
    const testimonials = [
        {
            name: 'John Smith',
            role: 'CTO at TechCorp',
            image: '/images/testimonial1.jpg',
            quote: 'CloudCostIQ has transformed how we manage our cloud spending. The AI-powered insights have helped us identify and eliminate waste we didn\'t even know existed.'
        },
        {
            name: 'Sarah Johnson',
            role: 'Cloud Architect at DataFlow',
            image: '/images/testimonial2.jpg',
            quote: 'The multi-cloud comparison feature is a game-changer. We\'ve optimized our workload placement across providers and saved significantly on our monthly bill.'
        },
        {
            name: 'Michael Chen',
            role: 'DevOps Lead at CloudScale',
            image: '/images/testimonial3.jpg',
            quote: 'The automated cost optimization recommendations have saved our team countless hours. It\'s like having a cloud cost expert working 24/7.'
        }
    ];

    return (
        <div id="testimonials" className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Testimonials</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">What our customers say</p>
                </div>
                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center mb-4">
                                <img src={testimonial.image} alt={testimonial.name} className="h-12 w-12 rounded-full" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-600">{testimonial.quote}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials; 