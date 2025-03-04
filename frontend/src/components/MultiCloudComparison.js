import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Tab, Tabs, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Alert, Button, Divider, Select, MenuItem, FormControl,
  InputLabel, TextField, Tooltip, IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import api from '../services/api';

// TabPanel component to display different tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cloud-tabpanel-${index}`}
      aria-labelledby={`cloud-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Format number as currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Multi-Cloud Comparison Component
 * 
 * This component provides comprehensive multi-cloud analysis including:
 * 1. Direct cost comparison between AWS, Azure, and GCP
 * 2. Migration cost analysis with ROI calculations
 * 3. Cross-cloud optimization recommendations
 */
const MultiCloudComparison = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerComparison, setProviderComparison] = useState([]);
  const [migrationAnalysis, setMigrationAnalysis] = useState({});
  const [crossCloudOptimizations, setCrossCloudOptimizations] = useState([]);
  const [selectedService, setSelectedService] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [availableServices, setAvailableServices] = useState([]);
  const [sourceProvider, setSourceProvider] = useState('AWS');
  const [targetProvider, setTargetProvider] = useState('Azure');

  // Fetch multi-cloud comparison data
  useEffect(() => {
    const fetchMultiCloudData = async () => {
      setIsLoading(true);
      try {
        // For demonstration purposes, we'll simulate API calls with mock data
        // In production, you'd use actual API endpoints
        // const response = await api.getMultiCloudComparison(timeRange, selectedService);
        
        // Generate mock data
        const mockProviderComparison = generateMockProviderComparison();
        const mockMigrationAnalysis = generateMockMigrationAnalysis(sourceProvider, targetProvider);
        const mockCrossCloudOptimizations = generateMockCrossCloudOptimizations();
        const mockServices = generateAvailableServices();
        
        setProviderComparison(mockProviderComparison);
        setMigrationAnalysis(mockMigrationAnalysis);
        setCrossCloudOptimizations(mockCrossCloudOptimizations);
        setAvailableServices(mockServices);
        setError(null);
      } catch (err) {
        console.error("Error fetching multi-cloud comparison:", err);
        setError("Failed to load multi-cloud comparison data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

  // Main render function
  return (
    <Container>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Multi-Cloud Comparison</Typography>
        <Typography variant="body1">
          Compare costs and services across cloud providers, analyze migration costs, 
          and discover cross-cloud optimization opportunities.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="multi-cloud comparison tabs">
          <Tab 
            label="Direct Cost Comparison" 
            icon={<CompareArrowsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Migration Cost Analysis" 
            icon={<MoveToInboxIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Cross-Cloud Optimization" 
            icon={<NorthIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {renderDirectComparison()}
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {renderMigrationAnalysis()}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {renderCrossCloudOptimization()}
      </TabPanel>
    </Container>
  );
};
    
    fetchMultiCloudData();
  }, [timeRange, selectedService, sourceProvider, targetProvider]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle service selection change
  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Handle source provider change
  const handleSourceProviderChange = (event) => {
    setSourceProvider(event.target.value);
  };

  // Handle target provider change
  const handleTargetProviderChange = (event) => {
    setTargetProvider(event.target.value);
  };

  // Generate mock provider comparison data
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

  // Generate mock migration analysis data
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

  // Generate mock cross-cloud optimization data
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

  // Generate available services for dropdown
  const generateAvailableServices = () => {
    return [
      { value: 'all', label: 'All Services' },
      { value: 'compute', label: 'Compute (EC2/VM/GCE)' },
      { value: 'storage', label: 'Storage (S3/Blob/GCS)' },
      { value: 'database', label: 'Database (RDS/SQL/Cloud SQL)' },
      { value: 'serverless', label: 'Serverless (Lambda/Functions)' },
      { value: 'container', label: 'Container (EKS/AKS/GKE)' },
      { value: 'network', label: 'Networking' }
    ];
  };

  // Render specific sections
  const renderDirectComparison = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    const filteredComparison = selectedService === 'all' 
      ? providerComparison 
      : providerComparison.filter(item => item.category.toLowerCase() === selectedService);

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="service-select-label">Service Category</InputLabel>
            <Select
              labelId="service-select-label"
              id="service-select"
              value={selectedService}
              label="Service Category"
              onChange={handleServiceChange}
            >
              {availableServices.map(service => (
                <MenuItem key={service.value} value={service.value}>
                  {service.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="quarter">Quarterly</MenuItem>
              <MenuItem value="year">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Service Category</strong></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/aws-logo.png" alt="AWS" width={24} height={24} style={{ marginRight: 8 }} />
                    <strong>AWS</strong>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/azure-logo.png" alt="Azure" width={24} height={24} style={{ marginRight: 8 }} />
                    <strong>Azure</strong>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/gcp-logo.png" alt="GCP" width={24} height={24} style={{ marginRight: 8 }} />
                    <strong>Google Cloud</strong>
                  </Box>
                </TableCell>
                <TableCell><strong>Lowest Cost</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComparison.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2"><strong>{item.aws.service}</strong></Typography>
                      <Typography variant="body2">{formatCurrency(item.aws.cost)}/{timeRange}</Typography>
                      <Typography variant="caption">{item.aws.features} features</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2"><strong>{item.azure.service}</strong></Typography>
                      <Typography variant="body2">
                        {formatCurrency(item.azure.cost)}/{timeRange}
                        {item.azure.savingsPercent > 0 && (
                          <Typography 
                            component="span" 
                            sx={{ color: 'success.main', ml: 1, fontSize: '0.75rem' }}
                          >
                            ({item.azure.savingsPercent.toFixed(1)}% less)
                          </Typography>
                        )}
                        {item.azure.savingsPercent < 0 && (
                          <Typography 
                            component="span" 
                            sx={{ color: 'error.main', ml: 1, fontSize: '0.75rem' }}
                          >
                            ({Math.abs(item.azure.savingsPercent).toFixed(1)}% more)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption">{item.azure.features} features</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2"><strong>{item.gcp.service}</strong></Typography>
                      <Typography variant="body2">
                        {formatCurrency(item.gcp.cost)}/{timeRange}
                        {item.gcp.savingsPercent > 0 && (
                          <Typography 
                            component="span" 
                            sx={{ color: 'success.main', ml: 1, fontSize: '0.75rem' }}
                          >
                            ({item.gcp.savingsPercent.toFixed(1)}% less)
                          </Typography>
                        )}
                        {item.gcp.savingsPercent < 0 && (
                          <Typography 
                            component="span" 
                            sx={{ color: 'error.main', ml: 1, fontSize: '0.75rem' }}
                          >
                            ({Math.abs(item.gcp.savingsPercent).toFixed(1)}% more)
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="caption">{item.gcp.features} features</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 1, 
                      borderRadius: 1,
                      bgcolor: item.lowestCostProvider === 'AWS' ? '#f0f9ff' : 
                               item.lowestCostProvider === 'Azure' ? '#f0f7ff' : 
                               '#f0f7fa'
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: item.lowestCostProvider === 'AWS' ? '#0066cc' : 
                                item.lowestCostProvider === 'Azure' ? '#0078d4' : 
                                '#4285f4',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.lowestCostProvider}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Summary Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Cost Comparison Summary</Typography>
                <Typography variant="body2" paragraph>
                  Based on our analysis of your current usage, comparing {timeRange}ly costs across providers:
                </Typography>
                <Typography variant="body2">
                  • AWS is lowest cost for {providerComparison.filter(i => i.lowestCostProvider === 'AWS').length} services
                </Typography>
                <Typography variant="body2">
                  • Azure is lowest cost for {providerComparison.filter(i => i.lowestCostProvider === 'Azure').length} services
                </Typography>
                <Typography variant="body2">
                  • GCP is lowest cost for {providerComparison.filter(i => i.lowestCostProvider === 'GCP').length} services
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Potential Annual Savings</Typography>
                <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>
                  {formatCurrency(providerComparison.reduce((total, item) => {
                    const lowestCost = Math.min(item.aws.cost, item.azure.cost, item.gcp.cost);
                    const currentCost = item.aws.cost; // Assuming AWS is current
                    return total + (currentCost - lowestCost) * (timeRange === 'month' ? 12 : timeRange === 'quarter' ? 4 : 1);
                  }, 0))}
                </Typography>
                <Typography variant="body2">
                  Potential savings by optimally distributing workloads across providers based on your current usage patterns.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recommendation</Typography>
                <Typography variant="body1" paragraph>
                  Consider a multi-cloud approach for maximum cost efficiency.
                </Typography>
                <Typography variant="body2">
                  Using a multi-cloud strategy targeting the most cost-effective provider for each service category could yield significant savings compared to a single-cloud approach.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={() => setActiveTab(2)} // Navigate to Cross-Cloud Optimization tab
                >
                  See Optimization Opportunities
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderMigrationAnalysis = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    const { source, target, services, summary } = migrationAnalysis;

    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="source-provider-label">Source Provider</InputLabel>
              <Select
                labelId="source-provider-label"
                id="source-provider"
                value={sourceProvider}
                label="Source Provider"
                onChange={handleSourceProviderChange}
              >
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
                <MenuItem value="GCP">GCP</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mx: 2 }}>
              <CompareArrowsIcon />
            </Box>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="target-provider-label">Target Provider</InputLabel>
              <Select
                labelId="target-provider-label"
                id="target-provider"
                value={targetProvider}
                label="Target Provider"
                onChange={handleTargetProviderChange}
              >
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
                <MenuItem value="GCP">GCP</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {source === target ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Source and target providers are the same. Please select different providers for migration analysis.
          </Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Migration Cost</Typography>
                    <Typography variant="h4">{formatCurrency(summary.totalMigrationCost)}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      One-time cost to migrate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Annual Savings</Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(summary.estimatedAnnualSavings)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Expected yearly savings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>ROI</Typography>
                    <Typography variant="h4">{summary.roi.toFixed(0)}%</Typography>
                    <Typography variant="body2" color="textSecondary">
                      First-year return on investment
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Break-even Point</Typography>
                    <Typography variant="h4">{summary.breakEvenMonths.toFixed(1)} months</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Time to recoup migration costs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Migration Details Table */}
            <Typography variant="h6" gutterBottom>Migration Resources Analysis</Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Resource Type</strong></TableCell>
                    <TableCell><strong>Source Service</strong></TableCell>
                    <TableCell><strong>Target Service</strong></TableCell>
                    <TableCell><strong>Resource Count</strong></TableCell>
                    <TableCell><strong>Complexity</strong></TableCell>
                    <TableCell><strong>Migration Cost</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.sourceService}</TableCell>
                      <TableCell>{service.targetService}</TableCell>
                      <TableCell>{service.count}</TableCell>
                      <TableCell>
                        {service.complexity === 1 && "Low"}
                        {service.complexity === 2 && "Medium"}
                        {service.complexity === 3 && "High"}
                      </TableCell>
                      <TableCell>{formatCurrency(service.migrationCost)}</TableCell>
                    </TableRow>
                  ))