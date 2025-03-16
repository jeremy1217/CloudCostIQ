import React from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const navigate = useNavigate();
    
    const handleGetStarted = () => {
        navigate('/register');
    };

    const plans = [
        {
            name: 'Standard',
            description: 'Perfect for small to medium businesses starting with cloud cost optimization',
            price: '$299',
            period: '/month',
            features: [
                'Up to 5 cloud accounts',
                'Basic cost analytics dashboard',
                'Costs by service breakdown',
                'Costs by provider analysis',
                'Basic cost optimization recommendations',
                'Monthly cost reports (PDF)',
                'Email support (48h response)',
                'Basic AI insights',
                'Read-only API access',
                '30-day data retention',
                '✕ Cost attribution',
                '✕ Multi-cloud comparison',
                '✕ Custom dashboards',
                '✕ Advanced AI features'
            ],
            isPopular: false
        },
        {
            name: 'Professional',
            description: 'For growing organizations with complex cloud infrastructure',
            price: '$799',
            period: '/month',
            features: [
                'Up to 15 cloud accounts',
                'Advanced cost analytics dashboard',
                'Detailed service cost analysis',
                'Cross-provider cost analysis',
                'Real-time optimization alerts',
                'Custom reports & dashboards',
                'Priority support (24h response)',
                'Advanced AI recommendations',
                'Full API access',
                'Cost attribution tools',
                'Multi-cloud comparison',
                '90-day data retention',
                'Slack/Teams integration',
                '✕ Custom AI model training',
                '✕ On-premise deployment',
                '✕ White-labeling'
            ],
            isPopular: true
        },
        {
            name: 'Enterprise',
            description: 'Custom solutions for large enterprises with mission-critical needs',
            price: 'Custom',
            period: '',
            features: [
                'Unlimited cloud accounts',
                'Enterprise analytics suite',
                'Custom dashboard builder',
                'Advanced cost modeling',
                'Predictive optimization',
                'Custom report templates',
                '24/7 dedicated support',
                'Custom AI model training',
                'Full API access with higher limits',
                'Advanced cost attribution',
                'Enhanced multi-cloud tools',
                'Unlimited data retention',
                'Custom integrations',
                'On-premise deployment option',
                'White-labeling available',
                'MSP/Reseller options',
                'Dedicated success manager',
                'Quarterly business reviews'
            ],
            isPopular: false
        }
    ];

    return (
        <div id="pricing" className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
                    <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Simple, transparent pricing</p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Choose the plan that best fits your needs</p>
                </div>
                <div className="mt-12 grid gap-8 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-lg ${plan.isPopular ? 'shadow-lg border-2 border-indigo-500 relative' : 'shadow-sm'} p-8 hover:shadow-lg transition-shadow`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                            <p className="mt-4 text-gray-500">{plan.description}</p>
                            <p className="mt-8">
                                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-base font-medium text-gray-500">{plan.period}</span>
                            </p>
                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <i className="fas fa-check text-green-500 mr-2"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleGetStarted}
                                className="mt-8 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing; 