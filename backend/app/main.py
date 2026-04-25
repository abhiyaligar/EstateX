from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, kyc, admin, builders, projects, wallet, exchange, users, analytics, governance, revenue
from app.core.config import settings
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.candle_service import open_daily_candles, close_daily_candles
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="EstateX Backend APIs"
)

# ─────────────────────────────────────────────────────────────────────────────
# APScheduler — Daily Candle Jobs (IST timezone)
# ─────────────────────────────────────────────────────────────────────────────
scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

@app.on_event("startup")
def start_scheduler():
    if os.environ.get("VERCEL"):
        logger.info("Running on Vercel — skipping background scheduler.")
        return

    # 12:00 AM IST — Open fresh candles for all active projects
    scheduler.add_job(
        open_daily_candles,
        'cron',
        hour=0, minute=0,
        id='open_daily_candles',
        replace_existing=True
    )
    # 11:59 PM IST — Finalize today's candles and roll previous_close_price
    scheduler.add_job(
        close_daily_candles,
        'cron',
        hour=23, minute=59,
        id='close_daily_candles',
        replace_existing=True
    )
    scheduler.start()
    logger.info("APScheduler started — Daily candle jobs registered.")

@app.on_event("shutdown")
def stop_scheduler():
    if not os.environ.get("VERCEL"):
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down.")

# ─────────────────────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # We use Bearer tokens, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(kyc.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(builders.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(wallet.router, prefix=settings.API_V1_STR)
app.include_router(exchange.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(governance.router, prefix=settings.API_V1_STR)
app.include_router(revenue.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to EstateX Backend API", "docs": "/docs"}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return ""

@app.get("/health")
def health_check():
    return {"status": "ok"}
