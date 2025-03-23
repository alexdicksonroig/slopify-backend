from typing import Union, Optional, List
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi import FastAPI, Depends
from starlette_admin.contrib.sqla import ModelView

from app.app.db.session import SessionLocal, init_db, admin


app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await init_db()

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: Optional[int] = None

async def get_session():
    async with SessionLocal() as session:
        yield session

@app.get("/")
def read_root():
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

admin.add_view(ModelView(Product))
admin.mount_to(app)
