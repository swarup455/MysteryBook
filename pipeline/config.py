import os 
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")