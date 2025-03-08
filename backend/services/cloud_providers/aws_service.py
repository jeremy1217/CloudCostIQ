import boto3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

class AWSService:
    """AWS Cloud Service integration"""
    
    def __init__(self, credentials: Dict[str, str]):
        """
        Initialize AWS service with credentials
        
        Args:
            credentials: Dict with access_key_id and secret_access_key
        """
        self.credentials = credentials
        self.cost_explorer = None
        
    def _get_cost_explorer(self):
        """Get or create a Cost Explorer client"""
        if not self.cost_explorer:
            self.cost_explorer = boto3.client(
                'ce',
                aws_access_key_id=self.credentials.get('access_key_id'),
                aws_secret_access_key=self.credentials.get('secret_access_key'),
                region_name='us-east-1'  # Cost Explorer is global, but API endpoint is in us-east-1
            )
        return self.cost_explorer
        
    def get_cost_data(self, start_date: datetime, end_date: datetime, granularity: str = "DAILY") -> List[Dict[str, Any]]:
        """
        Get cost data from AWS Cost Explorer
        
        Args:
            start_date: Start date for cost data
            end_date: End date for cost data
            granularity: Data granularity (DAILY, MONTHLY)
            
        Returns:
            List of cost data entries
        """
        client = self._get_cost_explorer()
        
        try:
            response = client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime("%Y-%m-%d"),
                    'End': end_date.strftime("%Y-%m-%d")
                },
                Granularity=granularity,
                Metrics=['UnblendedCost'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'}
                ]
            )
            
            results = []
            for time_period in response.get('ResultsByTime', []):
                date = time_period['TimePeriod']['Start']
                
                for group in time_period.get('Groups', []):
                    service = group['Keys'][0]
                    cost = float(group['Metrics']['UnblendedCost']['Amount'])
                    
                    results.append({
                        'provider': 'AWS',
                        'service': service,
                        'cost': cost,
                        'date': date
                    })
                    
            return results
            
        except Exception as e:
            print(f"Error fetching AWS cost data: {e}")
            return []