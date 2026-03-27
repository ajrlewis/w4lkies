from datetime import datetime
from io import BytesIO
import sys
import tempfile
from typing import Dict

from loguru import logger
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle

x_0 = 0.5 * inch
y_0 = 8.25 * inch

font_skip = 0.12 * inch
small_skip = 0.25 * inch
medium_skip = 0.5 * inch
big_skip = 1.0 * inch

currency = "£"
server_name = "w4lkies"
server_url = "https://w4lkies.com"
server_logo = "src/static/images/logo.png"
server_email = "hello@w4lkies.com"
server_bank_name = "Sophia Lewis"
server_bank_sort_code = "04-29-09"
server_bank_account_number = "65204158"
invoice_due_days = 7
invoice_currency = "£"
invoice_payment_request = ""
theme_color_1 = "#fd8927"
theme_color_2 = "#f4e2cc"
theme_color_3 = "#8bb4a6"
theme_font_1 = ""


def _add_header(pdf, income_statement, width, height):
    # Invoice logo
    logo_width = 150
    logo_aspect_ratio = 1.1
    logo_height = logo_aspect_ratio * logo_width

    from reportlab.lib.utils import ImageReader

    image_path = "src/static/images/logo.png"
    img = ImageReader(image_path)
    w, h = pdf.drawImage(
        img, x_0, y_0, width=logo_width, height=logo_height, mask="auto"
    )

    pdf.linkURL(
        server_url,
        (x_0, y_0, x_0 + w, y_0 + h),
        thickness=0,
        relative=1,
    )

    # Title
    pdf.setFont("Helvetica-Bold", 20)
    pdf.setFillColor(colors.black)
    x = width / 2
    y = 0.9 * height
    text = "Income Statement"
    pdf.drawCentredString(x, y, text.upper())

    # # Invoice IDs
    pdf.setFont("Helvetica", 12)
    pdf.setFillColor(colors.black)
    # x = x_0 + 4.25 * inch
    # y -= medium_skip
    # pdf.drawString(x, y, f"Reference: #{invoice.reference}")
    # y -= small_skip
    # pdf.drawString(x, y, f"Issued Date: {invoice.date_issued}")
    # y -= small_skip
    # text = f"Due Date: {invoice.date_due}"
    # pdf.drawString(x, y, text)

    # # Email contact for invoice help
    # y -= medium_skip
    # text = "Need help? "
    # pdf.drawString(x, y, text)
    # w = pdf.stringWidth(text)
    # x += w
    # text = server_email
    # pdf.drawString(x, y, text)
    # w = pdf.stringWidth(text)
    # h = pdf._leading
    # text = f"mailto:{server_email}?subject=Invoice #{invoice.reference}"
    # pdf.linkURL(
    #     text,
    #     (x, y, x + w, y + h),
    #     thickness=0,
    #     relative=1,
    # )
    # x = x_0 + medium_skip
    # y -= big_skip
    return x, y


def _add_page_break(pdf, income_statement, width, height):
    pdf.showPage()
    x, y = _add_header(pdf, income_statement, width, height)
    return x, y


def _create(income_statement):
    # Create document
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    x, y = _add_header(pdf, income_statement, width, height)
    x = x_0
    y -= big_skip
    y -= big_skip

    text = f"Period: {income_statement['date_start']} to {income_statement['date_end']}"
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(x, y, text)

    y -= big_skip
    table_data = [
        ["Metric", "Value"],
        [
            # "Total Invoices",
            "Revenue",
            f"{currency}{income_statement['price_total_invoices']:,.2f}",
        ],
        # [
        #     "Average Invoice",
        #     f"{currency}{income_statement['price_average_invoices']:,.2f}",
        # ],
        ["Number of Invoices", income_statement["number_of_invoices"]],
        [
            # "Total Expenses",
            "All expenses",
            f"{currency}{income_statement['price_total_expenses']:,.2f}",
        ],
        # [
        #     "Average Expense",
        #     f"{currency}{income_statement['price_average_expenses']:,.2f}",
        # ],
        ["Number of Expenses", income_statement["number_of_expenses"]],
        ["Gross Profit", f"{currency}{income_statement['profit_gross']:,.2f}"],
        # ["Net Profit", f"{currency}{income_statement['profit_net']:,.2f}"],
        ["Gross Profit Margin", f"{income_statement['profit_margin_gross']:,.2f}%"],
        # ["Net Profit Margin", f"{income_statement['profit_margin_net']:,.2f}%"],
    ]
    # table = Table(table_data, colWidths=[3.0 * inch, 3.0 * inch])
    table = Table(table_data, colWidths=[2.16 * inch, 2.16 * inch, 2.16 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), theme_color_1),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 12),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("BACKGROUND", (0, 1), (-1, -1), theme_color_2),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 11),
                ("ALIGN", (0, 1), (-1, -1), "LEFT"),
                # ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    # table_width, table_height = table.wrapOn(pdf, width, height)
    w, h = table.wrapOn(pdf, 400, 400)
    x = (width - w) / 2
    table.drawOn(pdf, x, y - h)

    # Save and create PDF file and filename
    pdf.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    pdf_file = BytesIO()
    pdf_file.write(pdf_bytes)
    pdf_file.seek(0)
    pdf_filepath = f"Income Statement {income_statement['date_start']} to {income_statement['date_end']}.pdf"

    return pdf_file, pdf_filepath


def create(income_statement):
    pdf_file, pdf_filepath = _create(income_statement)
    return pdf_file, pdf_filepath
