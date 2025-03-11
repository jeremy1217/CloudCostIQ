import api from './api';

const AI_MODELS = {
    COST_OPTIMIZATION: 'cost-optimization',
    PERFORMANCE: 'performance',
    SECURITY: 'security',
    RELIABILITY: 'reliability'
};

class AIRecommendationsService {
    async generateRecommendations(cloudData) {
        try {
            const response = await api.post('/ai/recommendations/generate', {
                cloudData,
                models: [AI_MODELS.COST_OPTIMIZATION]
            });
            return response.data;
        } catch (error) {
            console.error('Error generating AI recommendations:', error);
            // For development/demo, return mock AI recommendations
            return this.getMockAIRecommendations();
        }
    }

    async analyzeResource(resourceData) {
        try {
            const response = await api.post('/ai/recommendations/analyze', {
                resourceData
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing resource:', error);
            return null;
        }
    }

    getMockAIRecommendations() {
        return {
            recommendations: [
                {
                    id: 'ai-rec-1',
                    provider: 'AWS',
                    service: 'EC2',
                    suggestion: 'Based on your usage patterns, consider switching t3.xlarge instances to t3a.xlarge in us-east-1. This AMD-based instance type offers similar performance at a 10% lower cost.',
                    reasoning: [
                        'Current average CPU utilization is 45%',
                        'Workload patterns show consistent usage',
                        'No specific Intel CPU features being utilized'
                    ],
                    metrics: {
                        costTrend: {
                            current: 2345.00,
                            projected: 2110.50,
                            trend: -10.0,
                            historicalData: [2300, 2350, 2345, 2340, 2345]
                        },
                        performance: {
                            cpuUtilization: 45,
                            memoryUtilization: 60,
                            networkUtilization: 30,
                            performanceScore: 0.85,
                            benchmarks: {
                                cpu: {
                                    current: 45,
                                    optimal: 70,
                                    industry: 65,
                                    history: [42, 44, 45, 43, 45]
                                },
                                memory: {
                                    current: 60,
                                    optimal: 75,
                                    industry: 70,
                                    history: [58, 59, 60, 61, 60]
                                },
                                network: {
                                    current: 30,
                                    optimal: 50,
                                    industry: 45,
                                    history: [28, 29, 30, 31, 30]
                                },
                                iops: {
                                    current: 2500,
                                    optimal: 3000,
                                    industry: 2800,
                                    history: [2400, 2450, 2500, 2480, 2500]
                                }
                            },
                            resourceSpecific: {
                                instanceType: 't3.xlarge',
                                vcpus: 4,
                                memory: 16,
                                networkPerformance: 'Up to 5 Gigabit',
                                baselinePerformance: '60%'
                            }
                        },
                        roi: {
                            implementationEffort: 'LOW',
                            paybackPeriod: '2 weeks',
                            riskLevel: 'LOW'
                        }
                    },
                    benchmarkAnalysis: {
                        summary: 'Resource is underutilized compared to industry standards',
                        recommendations: [
                            'Current CPU utilization is 20% below industry average',
                            'Memory usage aligns with industry patterns',
                            'Network utilization indicates potential for downsizing'
                        ],
                        industryComparison: {
                            percentile: 35,
                            similarWorkloads: 'Web Application Servers',
                            efficiencyScore: 0.75
                        },
                        potentialImprovements: {
                            performance: 'Maintain current performance levels with smaller instance',
                            cost: 'Reduce costs by 10% with no performance impact',
                            reliability: 'No negative impact on reliability metrics'
                        }
                    },
                    estimatedSavings: 234.50,
                    confidence: 0.89,
                    implementation: {
                        steps: [
                            'Stop the instance during low-traffic period',
                            'Change instance type to t3a.xlarge',
                            'Start the instance and validate performance'
                        ],
                        command: 'aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type t3a.xlarge',
                        estimatedDuration: '30 minutes',
                        requiredPermissions: ['ec2:ModifyInstanceAttribute', 'ec2:StartInstances', 'ec2:StopInstances'],
                        validationSteps: [
                            'Monitor CPU utilization for 24 hours',
                            'Verify application response times',
                            'Check error rates and system logs'
                        ]
                    },
                    priority: 'HIGH'
                },
                {
                    id: 'ai-rec-2',
                    provider: 'AWS',
                    service: 'RDS',
                    suggestion: 'Your RDS instance db-prod-1 is oversized. Analysis shows peak CPU usage of 35% and memory usage of 40%. Consider downsizing to reduce costs.',
                    reasoning: [
                        'Peak CPU usage is 35% over last 30 days',
                        'Memory usage never exceeds 40%',
                        'Storage IOPS are within smaller instance capabilities'
                    ],
                    estimatedSavings: 187.25,
                    confidence: 0.92,
                    implementation: {
                        steps: [
                            'Schedule maintenance window',
                            'Modify instance class to db.t3.large',
                            'Monitor performance for 24 hours'
                        ],
                        command: 'aws rds modify-db-instance --db-instance-identifier db-prod-1 --db-instance-class db.t3.large'
                    },
                    priority: 'MEDIUM'
                },
                {
                    id: 'ai-rec-3',
                    provider: 'AWS',
                    service: 'S3',
                    suggestion: 'Implement intelligent tiering for S3 bucket "data-analytics-bucket". 45% of objects haven\'t been accessed in 90+ days.',
                    reasoning: [
                        'Large portion of data is infrequently accessed',
                        'Current storage cost is higher than necessary',
                        'Access patterns show predictable lifecycle'
                    ],
                    estimatedSavings: 156.80,
                    confidence: 0.95,
                    implementation: {
                        steps: [
                            'Enable S3 Intelligent-Tiering',
                            'Configure lifecycle rules',
                            'Monitor storage class transitions'
                        ],
                        command: 'aws s3api put-bucket-intelligent-tiering-configuration --bucket data-analytics-bucket --id "config1" --intelligent-tiering-configuration file://config.json'
                    },
                    priority: 'MEDIUM'
                },
                {
                    id: 'ai-rec-4',
                    provider: 'GCP',
                    service: 'Cloud SQL',
                    suggestion: 'Enable Cloud SQL automatic storage increase with a more conservative growth rate. Current settings may lead to over-provisioning.',
                    reasoning: [
                        'Storage growth rate is linear and predictable',
                        'Current auto-increase settings are aggressive',
                        'Historical data shows slower actual growth'
                    ],
                    estimatedSavings: 92.40,
                    confidence: 0.87,
                    implementation: {
                        steps: [
                            'Modify storage configuration',
                            'Set growth rate to 10%',
                            'Configure storage limit alerts'
                        ],
                        command: 'gcloud sql instances patch [INSTANCE_NAME] --storage-auto-increase-limit=100'
                    },
                    priority: 'LOW'
                }
            ],
            metadata: {
                generatedAt: new Date().toISOString(),
                modelVersion: '1.0.0',
                totalPotentialSavings: 670.95,
                confidenceAverage: 0.91,
                analysis: {
                    costMetrics: {
                        monthlySpend: 12500.00,
                        projectedSavings: 670.95,
                        savingsPercentage: 5.37,
                        topSpendingServices: ['EC2', 'RDS', 'S3']
                    },
                    resourceMetrics: {
                        totalResources: 145,
                        optimizableResources: 28,
                        resourceTypes: {
                            compute: 45,
                            storage: 65,
                            database: 25,
                            other: 10
                        },
                        performanceBenchmarks: {
                            compute: {
                                averageUtilization: 55,
                                industryAverage: 70,
                                optimizationScore: 0.78
                            },
                            storage: {
                                averageUtilization: 65,
                                industryAverage: 75,
                                optimizationScore: 0.85
                            },
                            database: {
                                averageUtilization: 45,
                                industryAverage: 60,
                                optimizationScore: 0.72
                            }
                        }
                    },
                    recommendationStats: {
                        total: 4,
                        byPriority: {
                            HIGH: 1,
                            MEDIUM: 2,
                            LOW: 1
                        },
                        byConfidence: {
                            high: 2,
                            medium: 1,
                            low: 1
                        }
                    },
                    historicalTrends: {
                        lastMonthSavings: 425.30,
                        savingsGrowth: 57.8,
                        implementedRecommendations: 12,
                        performanceHistory: {
                            compute: [52, 54, 55, 53, 55],
                            storage: [62, 64, 65, 65, 65],
                            database: [42, 43, 45, 44, 45]
                        }
                    }
                }
            }
        };
    }
}

export default new AIRecommendationsService(); 