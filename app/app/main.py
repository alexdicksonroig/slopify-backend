from typing import Union, Optional, List
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import FastAPI, Depends, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette_admin.contrib.sqla import ModelView
from app.app.core.config import settings
from loguru import logger
import os, stripe
from app.app.db.session import SessionLocal, init_db, admin


app = FastAPI()
origins = [
    'http://localhost:5173',
    'https://slopifyproject.com',
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stripe.api_key = settings.STRIPE_SECRET_KEY

@app.on_event("startup")
async def on_startup():
    # Don't block startup on database connection
    # DB will be initialized on first request
    logger.info("Application starting - database will be initialized on first use")
    pass

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: Optional[int] = None

_db_initialized = False

async def ensure_db_initialized():
    """Lazy database initialization on first use"""
    global _db_initialized
    if not _db_initialized:
        try:
            logger.info("Initializing database...")
            await init_db()
            _db_initialized = True
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise

async def get_session():
    await ensure_db_initialized()
    async with SessionLocal() as session:
        yield session

@app.get("/health")
def health_check():
    """Health check endpoint for Cloud Run - doesn't require DB"""
    return {"status": "healthy"}

@app.get("/")
def read_root():
    logger.info(f"{settings.STRIPE_SECRET_KEY}")
    return {"Hello": "World"}

@app.post("/products/", response_model=Product)
async def create_product(product: Product, session: Session = Depends(get_session)):
    db_product = Product.model_validate(product)

    session.add(db_product)
    await session.commit()
    await session.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[Product])
async def get_products(session: Session = Depends(get_session)):
    result = await session.exec(select(Product))
    products = result.all()
    return products

@app.post("/create-checkout-session")
async def create_checkout_session():

    try:
        session = stripe.checkout.Session.create(
            ui_mode="custom",
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": "Coffee Beans"},
                    "unit_amount": 1200,  # €12.00
                },
                "quantity": 1,
            }],
            return_url="http://localhost:5173/return?session_id={CHECKOUT_SESSION_ID}"
        )
        print(session)
        return session.client_secret
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/session-status")
async def session_status(session_id: str = Query(...)):
    session = stripe.checkout.Session.retrieve(session_id)
    return JSONResponse({
        "status": session.status,
        "customer_email": session.customer_details.email
    })

if __name__ == '__main__':
    app.run(port=4242)


admin.add_view(ModelView(Product))
admin.mount_to(app)
