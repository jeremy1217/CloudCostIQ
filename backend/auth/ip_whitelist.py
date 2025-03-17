from fastapi import Request, HTTPException
from ipaddress import ip_address, ip_network
from typing import List
from backend.config.settings import settings
import logging

logger = logging.getLogger(__name__)

def is_ip_in_whitelist(ip: str, whitelist: List[str]) -> bool:
    """Check if an IP is in the whitelist"""
    try:
        client_ip = ip_address(ip)
        return any(
            client_ip in ip_network(allowed_ip)
            for allowed_ip in whitelist
            if allowed_ip
        )
    except ValueError:
        return False

def is_domain_allowed(request: Request) -> bool:
    """Check if the request origin domain is allowed"""
    origin = request.headers.get('origin', '')
    if not origin:
        return False
    
    return any(
        allowed_domain in origin
        for allowed_domain in settings.ADMIN_ALLOWED_DOMAINS
        if allowed_domain
    )

async def verify_admin_access(request: Request):
    """Middleware to verify admin access based on IP and domain"""
    # Skip non-admin routes
    if not request.url.path.startswith('/api/admin'):
        return
    
    client_ip = request.client.host
    
    # Check IP whitelist
    if not is_ip_in_whitelist(client_ip, settings.ADMIN_ALLOWED_IPS):
        logger.warning(
            'Admin access attempted from unauthorized IP',
            extra={
                'ip': client_ip,
                'path': request.url.path,
                'method': request.method
            }
        )
        raise HTTPException(
            status_code=403,
            detail="Access denied: Your IP is not authorized for admin access"
        )
    
    # Check domain for CORS
    if request.headers.get('origin'):
        if not is_domain_allowed(request):
            logger.warning(
                'Admin access attempted from unauthorized domain',
                extra={
                    'origin': request.headers.get('origin'),
                    'ip': client_ip,
                    'path': request.url.path
                }
            )
            raise HTTPException(
                status_code=403,
                detail="Access denied: Origin not authorized for admin access"
            )

class AdminAccessMiddleware:
    """Middleware class for admin access control"""
    
    async def __call__(self, request: Request, call_next):
        try:
            await verify_admin_access(request)
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(
                'Error in admin access middleware',
                extra={'error': str(e)},
                exc_info=True
            )
            raise HTTPException(status_code=500, detail="Internal server error")
        
        response = await call_next(request)
        return response 