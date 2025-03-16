import React from 'react';

const Features = () => {
    const features = [
        {
            icon: 'chart-pie',
            title: 'Multi-cloud Cost Monitoring',
            description: 'Track costs across AWS, Azure, and GCP in a unified dashboard. Get comprehensive visibility into all your cloud spending.'
        },
        {
            icon: 'brain',
            title: 'AI-Powered Insights',
            description: 'Leverage advanced machine learning for anomaly detection, cost forecasting, and optimization recommendations.'
        },
        {
            icon: 'tags',
            title: 'Cost Attribution',
            description: 'Understand cloud spending by team, project, or environment. Improve accountability and budgeting across your organization.'
        },
        {
            icon: 'lightbulb',
            title: 'Cost Optimization',
            description: 'Receive actionable recommendations to reduce cloud costs. Implement changes with one click or custom scripts.'
        },
        {
            icon: 'exclamation-triangle',
            title: 'Anomaly Detection',
            description: 'Automatically identify unusual spending patterns and get alerted before they impact your bottom line.'
        },
        {
            icon: 'exchange-alt',
            title: 'Multi-Cloud Comparison',
            description: 'Compare costs across providers, analyze migration expenses, and identify multi-cloud optimization opportunities.'
        }
    ];

    return (
        <div id="features" className="py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Take control of your cloud costs</p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Discover how CloudCostIQ's AI-powered features help you make smarter cloud spending decisions.</p>
                </div>
                
                <div className="mt-16">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card pt-6">
                                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-lg">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                                                <i className={`fas fa-${feature.icon} text-white text-lg`}></i>
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                                        <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features; 