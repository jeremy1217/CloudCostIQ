# app/services/cost_analysis_extended.py
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract, cast, String, case
from sqlalchemy.sql.expression import literal_column
import json
from collections import defaultdict

from app.db.models import CostData, CloudAccount

class CostAnalysisService:
    """Enhanced service for analyzing cost data and generating visualizations."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_daily_costs_by_date(
        self, 
        start_date: datetime, 
        end_date: datetime,
        account_id: Optional[int] = None,
        service: Optional[str] = None,
        tag: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get daily costs for the specified period with filters."""
        query = self.db.query(
            func.date_trunc('day', CostData.date).label('date'),
            func.sum(CostData.cost).label('total_cost')
        ).filter(
            CostData.date >= start_date,
            CostData.date < end_date
        )
        
        # Apply filters
        query = self._apply_filters(query, account_id, service, tag)
        
        # Group by day and order by date
        return query.group_by('date').order_by('date').all()

    def get_grouped_costs(
        self, 
        start_date: datetime, 
        end_date: datetime,
        account_id: Optional[int] = None,
        service: Optional[str] = None,
        tag: Optional[str] = None,
        group_by: str = "month"
    ) -> List[Dict[str, Any]]:
        """
        Get costs grouped by a time period (day of week, month, year).
        Used for month-over-month or year-over-year comparisons.
        """
        if group_by == "day":
            # Group by day of week (1-7, where 1 is Monday)
            group_expr = extract('dow', CostData.date).label('group')
            
            # Convert numeric day to day name for readability
            day_names = {
                0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 
                4: "Fri", 5: "Sat", 6: "Sun"
            }
            
            # Use a CASE expression to map day numbers to day names
            group_expr = case(
                [(extract('dow', CostData.date) == literal_column(str(num)), literal_column(f"'{name}'")) 
                 for num, name in day_names.items()],
                else_=literal_column("'Unknown'")
            ).label('group')
        
        elif group_by == "month":
            # Group by month (1-12)
            group_expr = extract('month', CostData.date).label('group')
            
            # Convert numeric month to month name for readability
            month_names = {
                1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
                7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
            }
            
            # Use a CASE expression to map month numbers to month names
            group_expr = case(
                [(extract('month', CostData.date) == literal_column(str(num)), literal_column(f"'{name}'")) 
                 for num, name in month_names.items()],
                else_=literal_column("'Unknown'")
            ).label('group')
        
        else:  # group_by == "year"
            # Group by year
            group_expr = extract('year', CostData.date).label('group')
            # Convert to string for consistency
            group_expr = cast(extract('year', CostData.date), String).label('group')
        
        # Build query
        query = self.db.query(
            group_expr,
            func.sum(CostData.cost).label('total_cost')
        ).filter(
            CostData.date >= start_date,
            CostData.date < end_date
        )
        
        # Apply filters
        query = self._apply_filters(query, account_id, service, tag)
        
        # Group by the time period and order
        return query.group_by('group').order_by('group').all()

    def get_cost_breakdown(
        self, 
        start_date: datetime, 
        end_date: datetime,
        account_id: Optional[int] = None,
        service: Optional[str] = None,
        tag: Optional[str] = None,
        group_by: str = "service"
    ) -> List[Dict[str, Any]]:
        """
        Get cost breakdown by the specified grouping.
        Used for pie charts and similar visualizations.
        """
        base_query = self.db.query(CostData).filter(
            CostData.date >= start_date,
            CostData.date < end_date
        )
        
        # Apply common filters
        base_query = self._apply_filters(base_query, account_id, service, tag)
        
        if group_by == "service":
            # Group by service
            query = self.db.query(
                CostData.service.label('group'),
                func.sum(CostData.cost).label('total_cost')
            ).filter(
                CostData.id.in_([c.id for c in base_query])
            ).group_by(CostData.service).order_by(desc('total_cost'))
            
            return query.all()
        
        elif group_by == "account":
            # Group by cloud account
            query = self.db.query(
                CloudAccount.name.label('group'),
                func.sum(CostData.cost).label('total_cost')
            ).join(
                CloudAccount, 
                CostData.cloud_account_id == CloudAccount.id
            ).filter(
                CostData.id.in_([c.id for c in base_query])
            ).group_by(CloudAccount.name).order_by(desc('total_cost'))
            
            return query.all()
        
        elif group_by == "region":
            # Extract region from resource_id or tags
            # This is a simplified example; in reality, you would have a more robust way to get region
            
            # For this example, let's assume region is in the tags as 'region' or 'aws:region'
            results = []
            region_costs = defaultdict(float)
            
            for cost_data in base_query:
                region = "Unknown"
                
                # Try to extract region from tags
                if cost_data.tags:
                    if 'region' in cost_data.tags:
                        region = cost_data.tags['region']
                    elif 'aws:region' in cost_data.tags:
                        region = cost_data.tags['aws:region']
                
                region_costs[region] += cost_data.cost
            
            # Convert dictionary to result format
            for region, total_cost in sorted(region_costs.items(), key=lambda x: x[1], reverse=True):
                results.append(type('obj', (object,), {
                    'group': region,
                    'total_cost': total_cost
                }))
            
            return results
        
        elif group_by == "tag":
            # Group by tag key/value
            # This is more complex because tags are stored as JSON
            results = []
            tag_costs = defaultdict(float)
            
            for cost_data in base_query:
                if not cost_data.tags:
                    tag_costs["No Tags"] += cost_data.cost
                    continue
                
                # Group by each tag key/value pair
                for key, value in cost_data.tags.items():
                    tag_label = f"{key}: {value}"
                    tag_costs[tag_label] += cost_data.cost
            
            # Convert dictionary to result format and sort by cost
            for tag_label, total_cost in sorted(tag_costs.items(), key=lambda x: x[1], reverse=True):
                results.append(type('obj', (object,), {
                    'group': tag_label,
                    'total_cost': total_cost
                }))
            
            return results
        
        # Default fallback
        return []

    def get_detailed_costs(
        self, 
        start_date: datetime, 
        end_date: datetime,
        account_id: Optional[int] = None,
        service: Optional[str] = None,
        tag: Optional[str] = None
    ) -> List[CostData]:
        """
        Get detailed cost data for exports and detailed analysis.
        """
        query = self.db.query(CostData).filter(
            CostData.date >= start_date,
            CostData.date < end_date
        )
        
        # Apply filters
        query = self._apply_filters(query, account_id, service, tag)
        
        # Join with CloudAccount to get account details
        query = query.join(
            CloudAccount, 
            CostData.cloud_account_id == CloudAccount.id
        ).options(
            load_joiner(CloudAccount)
        )
        
        # Order by date
        return query.order_by(CostData.date, CostData.service).all()

    def get_available_services(self, account_id: Optional[int] = None) -> List[str]:
        """
        Get a list of all available services for filtering.
        """
        query = self.db.query(CostData.service).distinct()
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
        
        return [service[0] for service in query.order_by(CostData.service).all()]

    def get_available_tags(self, account_id: Optional[int] = None) -> List[Dict[str, str]]:
        """
        Get a list of all available tags and their values for filtering.
        """
        query = self.db.query(CostData.tags).filter(CostData.tags.isnot(None))
        
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
        
        # Extract unique tag keys and values
        tag_keys = set()
        tag_values = defaultdict(set)
        
        for tags_json in query.all():
            tags = tags_json[0]
            if not tags:
                continue
            
            for key, value in tags.items():
                tag_keys.add(key)
                tag_values[key].add(value)
        
        # Format the result
        result = []
        for key in sorted(tag_keys):
            for value in sorted(tag_values[key]):
                result.append({
                    'key': key,
                    'value': value
                })
        
        return result

    def _apply_filters(self, query, account_id: Optional[int] = None, service: Optional[str] = None, tag: Optional[str] = None):
        """
        Apply common filters to a query.
        """
        # Filter by account
        if account_id:
            query = query.filter(CostData.cloud_account_id == account_id)
        
        # Filter by service
        if service:
            query = query.filter(CostData.service == service)
        
        # Filter by tag
        if tag:
            # Parse tag filter (format: "key:value")
            try:
                key, value = tag.split(':', 1)
                # This is PostgreSQL specific - would need adjustment for other databases
                query = query.filter(
                    CostData.tags[key].astext == value
                )
            except ValueError:
                # Invalid tag format, ignore filter
                pass
        
        return query


# Helper function for SQLAlchemy options
def load_joiner(model):
    from sqlalchemy.orm import joinedload
    return joinedload(model.__name__.lower())