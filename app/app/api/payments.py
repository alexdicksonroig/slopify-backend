from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os, stripe
from app.app.core.config import settings


app = FastAPI()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


# ✅ 1. Stripe Checkout: create a checkout session
@app.post("/create-checkout-session")
async def create_checkout_session():

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": "Coffee Beans"},
                    "unit_amount": 1200,  # €12.00
                },
                "quantity": 1,
            }],
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
        )
        return {"id": session.id}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


# ✅ 2. Stripe Elements: create a PaymentIntent
@app.post("/create-payment-intent")
async def create_payment_intent():
    try:
        intent = stripe.PaymentIntent.create(
            amount=1200,  # €12.00
            currency="eur",
            automatic_payment_methods={"enabled": True},
        )
        return {"clientSecret": intent.client_secret}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


# ✅ 3. Webhook endpoint (shared by both flows)
@app.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

    # Handle successful payments
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print("✅ Checkout payment completed:", session["id"])

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        print("✅ Elements payment succeeded:", intent["id"])

    return {"status": "ok"}
