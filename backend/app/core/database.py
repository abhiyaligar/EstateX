from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase clients
supabase: Client = None 
supabase_admin: Client = None

try:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    logger.info("Supabase client initialized successfully")
    
    if settings.SUPABASE_SERVICE_KEY:
        supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        logger.info("Supabase Admin client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise
