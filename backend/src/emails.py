import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from loguru import logger

from config import settings


def send_email(
    to: list[str], subject: str, content: str, cc: list[str] = [], bcc: list[str] = []
):
    msg = MIMEMultipart()
    msg["From"] = f"{settings.MAIL_DEFAULT_SENDER_NAME} <{settings.MAIL_USERNAME}>"
    logger.debug(f'{msg["From"] = }')
    msg["To"] = ", ".join(to)
    logger.debug(f'{msg["To"] = }')
    msg["Cc"] = ", ".join(cc)
    logger.debug(f'{msg["Cc"] = }')
    msg["Bcc"] = ", ".join(bcc)
    logger.debug(f'{msg["Bcc"] = }')
    msg["Subject"] = subject
    logger.debug(f'{msg["Subject"] = }')
    msg.attach(MIMEText(content, "html"))

    all_recipients = to + cc + bcc
    logger.debug(f"{all_recipients = }")

    try:
        server = smtplib.SMTP(settings.MAIL_SERVER, 587)
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(msg["From"], all_recipients, msg.as_string())
        server.quit()
        logger.debug("Email sent successfully")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
