import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
from app.core.config import settings

def send_email(to_email: str, subject: str, body: str):
    smtp_host = settings.SMTP_HOST
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    smtp_password = settings.SMTP_PASSWORD
    sender_name = settings.SMTP_SENDER_NAME

    if not smtp_user or not smtp_password:
        print("SMTP credentials are not configured properly.")
        # In a real system, you might raise an exception, but for local testing
        # you might want to bypass or print the OTP to console.
        print(f"MOCK EMAIL SENT TO {to_email}: {body}")
        return

    msg = MIMEMultipart()
    msg['From'] = f"{sender_name} <{smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        # Port 465 uses SMTP_SSL
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"Successfully sent email to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send verification email.")
