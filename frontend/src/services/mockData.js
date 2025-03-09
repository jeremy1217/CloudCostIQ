export const generateDateRange = (daysCount, startFromToday = true) => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(today);
      const dayOffset = startFromToday ? i : -daysCount + i;
      date.setDate(date.getDate() + dayOffset);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  // Helper function to format date for display
  export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Generate historical cost data
  export const getMockHistoricalCostData = (days = 30) => {
    const data = [];
    const dates = generateDateRange(days, false);
    
    // Generate mock data with a realistic pattern
    // Base cost with some random variation and a slight upward trend
    dates.forEach((date, index) => {
      const cost = 100 + (index * 2) + (Math.random() * 20 - 10);
      data.push({
        date,
        cost: parseFloat(cost.toFixed(2))
      });
    });
    
    return data;
  };
  
  // Generate forecast data based on historical data
  export const getMockForecastData = (historicalData, days = 14) => {
    const forecast = [];
    
    if (!historicalData || historicalData.length === 0) {
      return forecast;
    }
    
    // Use the last historical data point as a starting point
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    const lastCost = historicalData[historicalData.length - 1].cost;
    
    // Simple linear regression coefficients (can be enhanced for more realistic forecasts)
    const trendFactor = 0.01; // 1% increase per day on average
    const volatilityFactor = 0.05; // 5% random fluctuation
    
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);
      
      // Calculate predicted cost with trend and some randomness
      const trendComponent = lastCost * (1 + (i * trendFactor));
      const randomComponent = trendComponent * (1 + ((Math.random() * 2 - 1) * volatilityFactor));
      const predictedCost = parseFloat(randomComponent.toFixed(2));
      
      // Calculate confidence intervals
      const uncertainty = 0.05 + (i * 0.005); // Uncertainty increases with time
      const lowerBound = parseFloat((predictedCost * (1 - uncertainty)).toFixed(2));
      const upperBound = parseFloat((predictedCost * (1 + uncertainty)).toFixed(2));
      
      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedCost,
        lowerBound,
        upperBound
      });
    }
    
    return forecast;
  };
  
  // Mock anomaly detection data
  export const getMockAnomalyData = () => {
    return [
      {
        id: 1,
        timestamp: '2025-02-28T14:23:12Z',
        service: 'EC2',
        region: 'us-east-1',
        resourceId: 'i-0abc123def456',
        description: 'Sudden 245% increase in compute usage',
        baseCost: 123.45,
        anomalyCost: 425.89,
        deviation: 245,
        status: 'open',
        confidence: 'high',
        pattern: 'spike',
        resourceGroup: 'production',
        tags: { 'environment': 'production', 'project': 'web-app' }
      },
      {
        id: 2,
        timestamp: '2025-02-27T08:12:45Z',
        service: 'S3',
        region: 'us-west-2',
        resourceId: 'customer-data-bucket',
        description: 'Unusual data transfer pattern',
        baseCost: 56.78,
        anomalyCost: 178.92,
        deviation: 215,
        status: 'investigating',
        confidence: 'medium',
        pattern: 'sustained',
        resourceGroup: 'data-storage',
        tags: { 'environment': 'production', 'data-classification': 'customer' }
      },
      {
        id: 3,
        timestamp: '2025-02-26T22:05:31Z',
        service: 'RDS',
        region: 'eu-west-1',
        resourceId: 'db-cluster-001',
        description: 'Database storage cost spike',
        baseCost: 234.56,
        anomalyCost: 389.12,
        deviation: 66,
        status: 'resolved',
        confidence: 'high',
        pattern: 'spike',
        resourceGroup: 'database',
        tags: { 'environment': 'staging', 'team': 'backend' }
      },
      {
        id: 4,
        timestamp: '2025-02-25T16:32:18Z',
        service: 'Lambda',
        region: 'us-east-2',
        resourceId: 'data-processor-function',
        description: 'Excessive function execution time',
        baseCost: 45.23,
        anomalyCost: 167.89,
        deviation: 271,
        status: 'open',
        confidence: 'high',
        pattern: 'recurring',
        resourceGroup: 'serverless',
        tags: { 'environment': 'production', 'team': 'data-science' }
      },
      {
        id: 5,
        timestamp: '2025-02-24T09:45:22Z',
        service: 'CloudFront',
        region: 'global',
        resourceId: 'distribution-001',
        description: 'Unusual data transfer to Asia Pacific',
        baseCost: 89.67,
        anomalyCost: 156.34,
        deviation: 74,
        status: 'dismissed',
        confidence: 'low',
        pattern: 'gradual',
        resourceGroup: 'content-delivery',
        tags: { 'environment': 'production', 'product': 'media-service' }
      },
      {
        id: 6,
        timestamp: '2025-02-23T11:28:42Z',
        service: 'EC2',
        region: 'ap-southeast-1',
        resourceId: 'i-0def456abc789',
        description: 'Instance running in non-business hours',
        baseCost: 67.89,
        anomalyCost: 112.45,
        deviation: 65,
        status: 'resolved',
        confidence: 'medium',
        pattern: 'recurring',
        resourceGroup: 'development',
        tags: { 'environment': 'development', 'team': 'frontend' }
      },
    ];
  };
  
  // Linear regression function for forecasting
  export const linearRegression = (data) => {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data.length > 0 ? data[0].cost : 0 };
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].cost;
      sumXY += i * data[i].cost;
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };
  
  // Get mock optimization recommendations
  export const getMockOptimizationRecommendations = () => {
    const current_recommendations = [
      {
        provider: "AWS",
        service: "EC2",
        suggestion: "Use Reserved Instances to save costs.",
        command: "aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type reserved",
        savings: 345.67,
        applied: false
      },
      {
        provider: "Azure",
        service: "VM",
        suggestion: "Resize underutilized virtual machines to optimize costs.",
        command: "az vm resize --resource-group myResourceGroup --name myVM --size Standard_B2s",
        savings: 128.90,
        applied: false
      },
      {
        provider: "AWS",
        service: "S3",
        suggestion: "Configure lifecycle policies to move data to lower-cost storage tiers.",
        command: "aws s3api put-bucket-lifecycle-configuration --bucket my-bucket --lifecycle-configuration file://lifecycle.json",
        savings: 87.45,
        applied: false
      },
      {
        provider: "GCP",
        service: "Compute Engine",
        suggestion: "Enable Committed Use Discounts for stable workloads.",
        command: "gcloud compute commitments create my-commitment --plan 12-month --region us-central1 --resources vcpu=4,memory=16GB",
        savings: 156.78,
        applied: false
      },
      {
        provider: "AWS",
        service: "RDS",
        suggestion: "Delete unused database snapshots.",
        command: "aws rds delete-db-snapshot --db-snapshot-identifier my-snapshot-id",
        savings: 42.35,
        applied: false
      }
    ];
  
    const past_recommendations = [
      {
        provider: "AWS",
        service: "Lambda",
        suggestion: "Optimize Lambda function memory allocations.",
        command: "aws lambda update-function-configuration --function-name my-function --memory-size 512",
        savings: 18.90,
        applied: true
      },
      {
        provider: "Azure",
        service: "Storage",
        suggestion: "Use Azure Blob lifecycle management for data retention.",
        command: "az storage account management-policy create --account-name myAccount --resource-group myRG --policy @policy.json",
        savings: 32.55,
        applied: true
      }
    ];
  
    return {
      current_recommendations,
      past_recommendations
    };
  };
  
  // Mock cost attribution data
  export const getMockCostAttributionData = (attributionType = 'team') => {
    if (attributionType === 'team') {
      return [
        { id: 1, name: 'Engineering', cost: 28456.78, percentChange: 5.7, increasing: true, resources: 126 },
        { id: 2, name: 'DevOps', cost: 15687.92, percentChange: -2.3, increasing: false, resources: 78 },
        { id: 3, name: 'Data Science', cost: 12345.67, percentChange: 8.2, increasing: true, resources: 54 },
        { id: 4, name: 'Frontend', cost: 9876.54, percentChange: 1.5, increasing: true, resources: 32 },
        { id: 5, name: 'Backend', cost: 8765.43, percentChange: -0.8, increasing: false, resources: 41 },
        { id: 6, name: 'QA', cost: 6543.21, percentChange: 3.1, increasing: true, resources: 28 },
        { id: 7, name: 'Admin', cost: 4321.09, percentChange: -4.2, increasing: false, resources: 19 }
      ];
    } else if (attributionType === 'project') {
      return [
        { id: 1, name: 'Customer Portal', cost: 18765.43, percentChange: 4.2, increasing: true, resources: 87 },
        { id: 2, name: 'Data Pipeline', cost: 16543.21, percentChange: 9.8, increasing: true, resources: 64 },
        { id: 3, name: 'Mobile App', cost: 12345.67, percentChange: -1.5, increasing: false, resources: 41 },
        { id: 4, name: 'Internal Tools', cost: 9876.54, percentChange: 0.7, increasing: true, resources: 35 },
        { id: 5, name: 'Legacy Migration', cost: 8765.43, percentChange: -6.3, increasing: false, resources: 28 },
        { id: 6, name: 'Marketplace', cost: 7654.32, percentChange: 3.8, increasing: true, resources: 32 },
        { id: 7, name: 'Analytics Platform', cost: 6543.21, percentChange: 5.2, increasing: true, resources: 24 }
      ];
    } else if (attributionType === 'environment') {
      return [
        { id: 1, name: 'Production', cost: 45678.90, percentChange: 3.4, increasing: true, resources: 156 },
        { id: 2, name: 'Staging', cost: 23456.78, percentChange: 1.8, increasing: true, resources: 89 },
        { id: 3, name: 'Development', cost: 12345.67, percentChange: -2.1, increasing: false, resources: 67 },
        { id: 4, name: 'QA', cost: 5678.90, percentChange: -4.5, increasing: false, resources: 42 }
      ];
    } else if (attributionType === 'costCenter') {
      return [
        { id: 1, name: 'Engineering', cost: 34567.89, percentChange: 2.8, increasing: true, resources: 142 },
        { id: 2, name: 'Product', cost: 23456.78, percentChange: 5.6, increasing: true, resources: 98 },
        { id: 3, name: 'Marketing', cost: 12345.67, percentChange: -1.2, increasing: false, resources: 45 },
        { id: 4, name: 'Sales', cost: 8765.43, percentChange: 3.5, increasing: true, resources: 32 },
        { id: 5, name: 'Finance', cost: 6543.21, percentChange: -0.7, increasing: false, resources: 26 },
        { id: 6, name: 'HR', cost: 3456.78, percentChange: 1.1, increasing: true, resources: 14 }
      ];
    }
    
    return [];
  };
  
  // Mock untagged resources data
  export const getMockUntaggedResourcesData = () => {
    return [
      { id: 'i-abc12345', type: 'EC2 Instance', cost: 567.89, age: 45 },
      { id: 'vol-def67890', type: 'EBS Volume', cost: 123.45, age: 67 },
      { id: 'eni-ghi12345', type: 'Network Interface', cost: 45.67, age: 32 },
      { id: 'nat-jkl67890', type: 'NAT Gateway', cost: 234.56, age: 89 },
      { id: 'sg-mno12345', type: 'Security Group', cost: 0, age: 123 },
      { id: 'snap-pqr67890', type: 'EBS Snapshot', cost: 78.90, age: 45 },
      { id: 'lb-stu12345', type: 'Load Balancer', cost: 345.67, age: 56 }
    ];
  };
  
  // Generate combined insights mock data
  export const getMockCombinedInsights = (params = {}) => {
    const daysToAnalyze = params.days || 30;
    const daysToForecast = params.forecast_days || 14;
    
    const historicalData = getMockHistoricalCostData(daysToAnalyze);
    const forecastData = getMockForecastData(historicalData, daysToForecast);
    const anomalies = getMockAnomalyData().slice(0, 3); // Just take a few anomalies
    const optimizationData = getMockOptimizationRecommendations();
    
    // Calculate total costs and savings
    const totalHistoricalCost = historicalData.reduce((sum, item) => sum + item.cost, 0);
    const totalForecastCost = forecastData.reduce((sum, item) => sum + item.predictedCost, 0);
    const totalPotentialSavings = optimizationData.current_recommendations.reduce(
      (sum, rec) => sum + (rec.savings || 0), 0
    );
    
    return {
      summary: {
        total_cost: parseFloat(totalHistoricalCost.toFixed(2)),
        forecast_total: parseFloat(totalForecastCost.toFixed(2)),
        anomaly_count: anomalies.length,
        potential_savings: parseFloat(totalPotentialSavings.toFixed(2)),
        days_analyzed: daysToAnalyze,
        days_forecasted: daysToForecast
      },
      forecast: forecastData,
      anomalies: anomalies,
      optimizations: optimizationData.current_recommendations,
      ai_metadata: {
        forecast_algorithm: 'ensemble',
        anomaly_method: 'isolation_forest',
        optimization_categories: 5
      }
    };
  };