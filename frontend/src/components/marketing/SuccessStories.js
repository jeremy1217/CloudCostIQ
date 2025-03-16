import React from 'react';

const SuccessStories = () => {
    const stories = [
        {
            company: 'TechCorp',
            type: 'Software Company',
            logo: '/images/company1.png',
            description: 'Reduced cloud costs by 45% in the first three months while maintaining performance.',
            metric: '$250K/year saved'
        },
        {
            company: 'DataFlow',
            type: 'Data Analytics',
            logo: '/images/company2.png',
            description: 'Optimized multi-cloud infrastructure and eliminated redundant services.',
            metric: '35% cost reduction'
        },
        {
            company: 'CloudScale',
            type: 'E-commerce',
            logo: '/images/company3.png',
            description: 'Automated cost optimization across AWS and Azure environments.',
            metric: '$180K/year saved'
        }
    ];

    return (
        <div id="success-stories" className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Success Stories</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Real results from real customers</p>
                </div>
                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {stories.map((story, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <img src={story.logo} alt={story.company} className="h-12 w-12 rounded-full" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{story.company}</h3>
                                    <p className="text-sm text-gray-500">{story.type}</p>
                                </div>
                            </div>
                            <p className="text-gray-600">{story.description}</p>
                            <p className="mt-4 text-2xl font-bold text-indigo-600">{story.metric}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuccessStories; 