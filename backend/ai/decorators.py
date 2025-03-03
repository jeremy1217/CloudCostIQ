import functools
import logging

logger = logging.getLogger(__name__)

def with_fallback(fallback_function):
    """
    Decorator that runs fallback_function if the decorated function fails.
    
    Args:
        fallback_function: Function to run if the decorated function raises an exception
        
    Returns:
        Decorated function with fallback behavior
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in {func.__name__}: {str(e)}")
                logger.info(f"Falling back to {fallback_function.__name__}")
                return fallback_function(*args, **kwargs)
        return wrapper
    return decorator