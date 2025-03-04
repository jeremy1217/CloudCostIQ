import api from './api';

/**
 * Multi-Cloud Comparison API Service
 * 
 * This service provides methods for accessing multi-cloud comparison data including:
 * - Direct cost comparison between cloud providers
 * - Migration cost analysis between providers
 * - Cross-cloud optimization opportunities
 */

/**
 * Get direct cost comparison between cloud providers
 * 
 * @param {string} timeRange - Time range for comparison ('month', 'quarter', 'year')
 * @param {string} serviceCategory - Service category filter ('all', 'compute', 'storage', etc.)
 * @returns {Promise<Object>} - Comparison data
 */
export const getProviderComparison = async (timeRange = 'month', serviceCategory = 'all') => {
  try {
    // In a real implementation, this would call the API
    const response = await api.get('/multi-cloud/comparison', {
      params: { timeRange, serviceCategory }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching provider comparison:', error);
    
    // For demonstration purposes, return mock data
    return generateMockProviderComparison();
  }
};

/**
 * Get migration cost analysis between providers
 * 
 * @param {string} sourceProvider - Source cloud provider ('AWS', 'Azure', 'GCP')
 * @param {string} targetProvider - Target cloud provider ('AWS', 'Azure', 'GCP')
 * @returns {Promise<Object>} - Migration analysis data
 */
export const getMigrationAnalysis = async (sourceProvider = 'AWS', targetProvider = 'Azure') => {
  try {
    // In a real implementation, this would call the API
    const response = await api.get('/multi-cloud/migration-analysis', {
      params: { sourceProvider, targetProvider }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching migration analysis:', error);
    
    // For demonstration purposes, return mock data
    return generateMockMigrationAnalysis(sourceProvider, targetProvider);
  }
};

/**
 * Get cross-cloud optimization opportunities
 * 
 * @returns {Promise<Array>} - List of optimization opportunities
 */
export const getCrossCloudOptimizations = async () => {
  try {
    // In a real implementation, this would call the API
    const response = await api.get('/multi-cloud/optimizations');
    return response.data;
  } catch (error) {
    console.error('Error fetching cross-cloud optimizations:', error);
    
    // For demonstration purposes, return mock data
    return generateMockCrossCloudOptimizations();
  }
};

/**
 * Generate a detailed migration plan between cloud providers
 * 
 * @param {string} sourceProvider - Source cloud provider
 * @param {string} targetProvider - Target cloud provider
 * @param {Object} options - Migration plan options
 * @returns {Promise<Object>} - Migration plan data
 */
export const generateMigrationPlan = async (sourceProvider, targetProvider, options = {}) => {
  try {
    // In a real implementation, this would call the API
    const response = await api.post('/multi-cloud/migration-plan', {
      sourceProvider,
      targetProvider,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error generating migration plan:', error);
    throw new Error('Failed to generate migration plan');
  }
};

/**
 * Get service mapping between cloud providers
 * 
 * @param {string} sourceProvider - Source cloud provider
 * @param {string} targetProvider - Target cloud provider
 * @returns {Promise<Array>} - List of service mappings
 */
export const getServiceMapping = async (sourceProvider, targetProvider) => {
  try {
    // In a real implementation, this would call the API
    const response = await api.get('/multi-cloud/service-mapping', {
      params: { sourceProvider, targetProvider }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching service mapping:', error);
    
    // Generate mock service mapping
    return [
      { source: `${sourceProvider} EC2`, target: `${targetProvider} VM` },
      { source: `${sourceProvider} S3`, target: `${targetProvider} Blob Storage` },
      { source: `${sourceProvider} RDS`, target: `${targetProvider} SQL Database` }
    ];
  }
};

// Mock data generation functions (same as those in the component)
const generateMockProviderComparison = () => {
  const services = [
    { name: 'Compute', awsService: 'EC2', azureService: 'Virtual Machines', gcpService: 'Compute Engine' },
    { name: 'Storage', awsService: 'S3', azureService: 'Blob Storage', gcpService: 'Cloud Storage' },
    { name: 'Database', awsService: 'RDS', azureService: 'SQL Database', gcpService: 'Cloud SQL' },
    { name: 'Serverless', awsService: 'Lambda', azureService: 'Functions', gcpService: 'Cloud Functions' },
    { name: 'Container', awsService: 'EKS', azureService: 'AKS', gcpService: 'GKE' }
  ];
  
  return services.map(service => {
    // Generate costs with AWS as baseline, and others as variations
    const awsCost = 100 + Math.random() * 900;
    const azureCost = awsCost * (0.8 + Math.random() * 0.4); // 80-120% of AWS cost
    const gcpCost = awsCost * (0.75 + Math.random() * 0.5); // 75-125% of AWS cost
    
    // Calculate savings percentages relative to AWS
    const azureSavings = ((awsCost - azureCost) / awsCost) * 100;
    const gcpSavings = ((awsCost - gcpCost) / awsCost) * 100;
    
    return {
      category: service.name,
      aws: {
        service: service.awsService,
        cost: awsCost,
        features: Math.floor(7 + Math.random() * 4) // 7-10 features
      },
      azure: {
        service: service.azureService,
        cost: azureCost,
        features: Math.floor(6 + Math.random() * 5), // 6-10 features
        savingsPercent: azureSavings
      },
      gcp: {
        service: service.gcpService,
        cost: gcpCost,
        features: Math.floor(6 + Math.random() * 5), // 6-10 features
        savingsPercent: gcpSavings
      },
      lowestCostProvider: azureCost < gcpCost && azureCost < awsCost ? 'Azure' : 
                        gcpCost < azureCost && gcpCost < awsCost ? 'GCP' : 'AWS'
    };
  });
};

const generateMockMigrationAnalysis = (source, target) => {
  // Mapping provider to index
  const providerIndex = {
    'AWS': 0,
    'Azure': 1,
    'GCP': 2
  };
  
  // Complexity factors for each migration path (source -> target)
  const complexityMatrix = [
    // AWS → ... 
    [0, 2, 3], // AWS → AWS (same), AWS → Azure, AWS → GCP
    // Azure → ...
    [3, 0, 2], // Azure → AWS, Azure → Azure (same), Azure → GCP
    // GCP → ...
    [3, 2, 0]  // GCP → AWS, GCP → Azure, GCP → GCP (same)
  ];
  
  // Get complexity factor (1-3, with 3 being most complex)
  const complexityFactor = complexityMatrix[providerIndex[source]][providerIndex[target]];
  
  // Generate services to migrate
  const services = [
    { 
      name: 'Compute Instances', 
      sourceService: source === 'AWS' ? 'EC2' : source === 'Azure' ? 'Virtual Machines' : 'Compute Engine',
      targetService: target === 'AWS' ? 'EC2' : target === 'Azure' ? 'Virtual Machines' : 'Compute Engine',
      count: Math.floor(10 + Math.random() * 40),
      complexity: Math.min(3, Math.max(1, complexityFactor))
    },
    { 
      name: 'Storage Buckets', 
      sourceService: source === 'AWS' ? 'S3' : source === 'Azure' ? 'Blob Storage' : 'Cloud Storage',
      targetService: target === 'AWS' ? 'S3' : target === 'Azure' ? 'Blob Storage' : 'Cloud Storage',
      count: Math.floor(5 + Math.random() * 15),
      complexity: Math.min(3, Math.max(1, complexityFactor - 1))
    },
    { 
      name: 'Databases', 
      sourceService: source === 'AWS' ? 'RDS' : source === 'Azure' ? 'SQL Database' : 'Cloud SQL',
      targetService: target === 'AWS' ? 'RDS' : target === 'Azure' ? 'SQL Database' : 'Cloud SQL',
      count: Math.floor(2 + Math.random() * 8),
      complexity: Math.min(3, Math.max(1, complexityFactor + 1))
    },
    { 
      name: 'Load Balancers', 
      sourceService: source === 'AWS' ? 'ELB' : source === 'Azure' ? 'Load Balancer' : 'Cloud Load Balancing',
      targetService: target === 'AWS' ? 'ELB' : target === 'Azure' ? 'Load Balancer' : 'Cloud Load Balancing',
      count: Math.floor(1 + Math.random() * 5),
      complexity: Math.min(3, Math.max(1, complexityFactor))
    }
  ];
  
  // Calculate migration costs based on complexity and number of resources
  const calculateMigrationCost = (service) => {
    const baseCost = {
      1: 100, // Low complexity
      2: 250, // Medium complexity
      3: 500  // High complexity
    }[service.complexity];
    
    return service.count * baseCost;
  };
  
  // Calculate expected savings (annual)
  const sourceAnnualCost = 120000 + Math.random() * 180000; // $120k-$300k
  const targetAnnualCost = sourceAnnualCost * (0.7 + Math.random() * 0.2); // 70-90% of source cost
  const estimatedAnnualSavings = sourceAnnualCost - targetAnnualCost;
  
  // Calculate total migration cost
  const totalMigrationCost = services.reduce((total, service) => total + calculateMigrationCost(service), 0);
  
  // Calculate ROI and break-even point
  const roi = (estimatedAnnualSavings / totalMigrationCost) * 100;
  const breakEvenMonths = (totalMigrationCost / (estimatedAnnualSavings / 12));
  
  return {
    source,
    target,
    services: services.map(service => ({
      ...service,
      migrationCost: calculateMigrationCost(service)
    })),
    summary: {
      totalResources: services.reduce((total, service) => total + service.count, 0),
      totalMigrationCost,
      estimatedAnnualSavings,
      roi,
      breakEvenMonths
    }
  };
};

const generateMockCrossCloudOptimizations = () => {
  return [
    {
      id: 1,
      name: 'Use Azure Blob Storage for Archival',
      description: 'Move cold storage data from AWS S3 to Azure Blob Storage Archive tier for 40% cost reduction.',
      sourceProvider: 'AWS',
      sourceService: 'S3',
      targetProvider: 'Azure',
      targetService: 'Blob Storage',
      annualSavings: 12500,
      implementationComplexity: 'Medium',
      dataTransferCost: 800,
      suggestedApproach: 'Use Azure Storage Mover service to migrate data incrementally.'
    },
    {
      id: 2,
      name: 'Leverage GCP Spot VMs for Batch Processing',
      description: 'Move batch processing workloads from AWS EC2 to GCP Spot VMs for up to 60% cost savings.',
      sourceProvider: 'AWS',
      sourceService: 'EC2',
      targetProvider: 'GCP',
      targetService: 'Compute Engine',
      annualSavings: 28750,
      implementationComplexity: 'Medium',
      dataTransferCost: 1200,
      suggestedApproach: 'Containerize batch processing jobs and use GCP Batch with Spot VMs.'
    },
    {
      id: 3,
      name: 'Multi-Region Redundancy with GCP',
      description: 'Use GCP Cloud CDN as an alternative to CloudFront for 25% cost reduction in specific regions.',
      sourceProvider: 'AWS',
      sourceService: 'CloudFront',
      targetProvider: 'GCP',
      targetService: 'Cloud CDN',
      annualSavings: 9500,
      implementationComplexity: 'Low',
      dataTransferCost: 600,
      suggestedApproach: 'Gradually route traffic through GCP Cloud CDN for specific regions while keeping CloudFront for others.'
    },
    {
      id: 4,
      name: 'Use AWS Aurora for High-Performance Databases',
      description: 'Migrate performance-critical databases from Azure SQL to AWS Aurora for better price/performance ratio.',
      sourceProvider: 'Azure',
      sourceService: 'SQL Database',
      targetProvider: 'AWS',
      targetService: 'Aurora',
      annualSavings: 18200,
      implementationComplexity: 'High',
      dataTransferCost: 1500,
      suggestedApproach: 'Use AWS Database Migration Service for minimal downtime migration.'
    },
    {
      id: 5,
      name: 'Microsoft Workloads on Azure',
      description: 'Leverage Azure Hybrid Benefit to run Windows workloads more cost-effectively than on AWS or GCP.',
      sourceProvider: 'AWS',
      sourceService: 'EC2 (Windows)',
      targetProvider: 'Azure',
      targetService: 'Virtual Machines',
      annualSavings: 32000,
      implementationComplexity: 'Medium',
      dataTransferCost: 1800,
      suggestedApproach: 'Use Azure Migrate to assess and migrate Windows VM workloads from AWS.'
    }
  ];
};

// Default export
export default {
  getProviderComparison,
  getMigrationAnalysis,
  getCrossCloudOptimizations,
  generateMigrationPlan,
  getServiceMapping
};