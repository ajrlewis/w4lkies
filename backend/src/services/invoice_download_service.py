from io import BytesIO

from loguru import logger
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle

currency = "£"
server_name = "w4lkies"
server_url = "https://w4lkies.com"
server_logo = "src/static/images/logo.png"
server_email = "hello@w4lkies.com"
server_bank_sort_code = "04-29-09"
server_bank_account_number = "65204158"
invoice_currency = "£"
invoice_payment_request = ""

# Matches frontend brand tokens from `frontend/src/index.css`.
COLOR_NAVY = colors.HexColor("#2f4858")
COLOR_ORANGE = colors.HexColor("#ff9a36")
COLOR_ACCENT = colors.HexColor("#ff6800")
COLOR_CREAM = colors.HexColor("#f9fafb")
COLOR_SAGE = colors.HexColor("#93bfb0")
COLOR_TEXT = colors.HexColor("#2f4858")
COLOR_MUTED = colors.HexColor("#64748b")
COLOR_BORDER = colors.HexColor("#e5e7eb")

PAGE_MARGIN_X = 0.55 * inch
PAGE_MARGIN_TOP = 0.45 * inch
PAGE_MARGIN_BOTTOM = 0.55 * inch
HEADER_HEIGHT = 1.55 * inch


def _format_date(date_value) -> str:
    if not date_value:
        return "N/A"
    if hasattr(date_value, "strftime"):
        return date_value.strftime("%d %b %Y")
    return str(date_value)


def _draw_header(pdf: canvas.Canvas, invoice, width: float, height: float) -> float:
    header_top = height - PAGE_MARGIN_TOP
    header_bottom = header_top - HEADER_HEIGHT

    pdf.setFillColor(COLOR_CREAM)
    pdf.roundRect(
        PAGE_MARGIN_X,
        header_bottom,
        width - (2 * PAGE_MARGIN_X),
        HEADER_HEIGHT,
        14,
        fill=1,
        stroke=0,
    )

    logo_width = 1.7 * inch
    logo_height = 1.3 * inch
    logo_x = PAGE_MARGIN_X + 0.2 * inch
    logo_y = header_bottom + 0.15 * inch

    try:
        img = ImageReader(server_logo)
        raw_width, raw_height = img.getSize()
        if raw_width > 0 and raw_height > 0:
            # Preserve the original logo aspect ratio while fitting the frame.
            scale = min(logo_width / raw_width, logo_height / raw_height)
            draw_width = raw_width * scale
            draw_height = raw_height * scale
        else:
            draw_width = logo_width
            draw_height = logo_height
        draw_x = logo_x + (logo_width - draw_width) / 2
        draw_y = logo_y + (logo_height - draw_height) / 2
        pdf.drawImage(
            img,
            draw_x,
            draw_y,
            width=draw_width,
            height=draw_height,
            mask="auto",
        )
        pdf.linkURL(
            server_url,
            (draw_x, draw_y, draw_x + draw_width, draw_y + draw_height),
            thickness=0,
            relative=1,
        )
    except Exception as error:
        logger.warning(f"Failed to draw logo: {error}")

    pdf.setFillColor(COLOR_NAVY)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(PAGE_MARGIN_X + 2.05 * inch, header_top - 0.55 * inch, "INVOICE")

    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(COLOR_MUTED)
    pdf.drawString(PAGE_MARGIN_X + 2.05 * inch, header_top - 0.85 * inch, server_name.upper())

    card_width = 2.55 * inch
    card_height = 1.2 * inch
    card_x = width - PAGE_MARGIN_X - card_width - 0.16 * inch
    card_y = header_top - card_height - 0.18 * inch
    pdf.setFillColor(colors.white)
    pdf.setStrokeColor(COLOR_BORDER)
    pdf.setLineWidth(1)
    pdf.roundRect(card_x, card_y, card_width, card_height, 10, fill=1, stroke=1)

    text_x = card_x + 0.16 * inch
    text_y = card_y + card_height - 0.25 * inch
    pdf.setFont("Helvetica-Bold", 9.8)
    pdf.setFillColor(COLOR_ACCENT)
    pdf.drawString(text_x, text_y, f"Ref: {invoice.reference}")

    pdf.setFont("Helvetica", 9.2)
    pdf.setFillColor(COLOR_TEXT)
    text_y -= 0.22 * inch
    pdf.drawString(text_x, text_y, f"Issued: {_format_date(invoice.date_issued)}")
    text_y -= 0.2 * inch
    pdf.drawString(text_x, text_y, f"Due: {_format_date(invoice.date_due)}")
    text_y -= 0.2 * inch
    pdf.drawString(text_x, text_y, f"Need help? {server_email}")

    email_width = pdf.stringWidth(server_email, "Helvetica", 9.2)
    email_x = text_x + pdf.stringWidth("Need help? ", "Helvetica", 9.2)
    pdf.linkURL(
        f"mailto:{server_email}?subject=Invoice {invoice.reference}",
        (
            email_x,
            text_y - 0.03 * inch,
            email_x + email_width,
            text_y + 0.1 * inch,
        ),
        thickness=0,
        relative=1,
    )

    return header_bottom - 0.2 * inch


def _draw_bill_to_block(pdf: canvas.Canvas, invoice, width: float, y_top: float) -> float:
    box_height = 0.92 * inch
    box_y = y_top - box_height
    box_width = width - (2 * PAGE_MARGIN_X)

    pdf.setFillColor(colors.white)
    pdf.setStrokeColor(COLOR_BORDER)
    pdf.setLineWidth(1)
    pdf.roundRect(PAGE_MARGIN_X, box_y, box_width, box_height, 10, fill=1, stroke=1)

    text_x = PAGE_MARGIN_X + 0.18 * inch
    text_y = box_y + box_height - 0.23 * inch
    pdf.setFont("Helvetica-Bold", 10.5)
    pdf.setFillColor(COLOR_NAVY)
    pdf.drawString(text_x, text_y, f"Bill To: {invoice.customer.name}")

    pdf.setFont("Helvetica", 9.5)
    pdf.setFillColor(COLOR_MUTED)
    text_y -= 0.22 * inch
    pdf.drawString(
        text_x,
        text_y,
        f"Service Period: {_format_date(invoice.date_start)} to {_format_date(invoice.date_end)}",
    )
    return box_y - 0.2 * inch


def _build_bookings_table(bookings: list) -> Table:
    table_header = ["Date & Time", "Service", f"Price ({currency})"]
    table_data = [table_header]

    if not bookings:
        table_data.append(["No bookings in selected period", "-", "0.00"])
    else:
        for booking in bookings:
            booking_date = _format_date(booking.date)
            booking_time = (
                booking.time.strftime("%I:%M %p")
                if hasattr(booking.time, "strftime")
                else str(booking.time)
            )
            table_data.append(
                [
                    f"{booking_date} {booking_time}",
                    booking.service.name,
                    f"{booking.service.price:.2f}",
                ]
            )

    table = Table(table_data, colWidths=[2.35 * inch, 2.85 * inch, 1.15 * inch])
    table_style = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), COLOR_ORANGE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10.5),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            ("TEXTCOLOR", (0, 1), (-1, -1), COLOR_TEXT),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 9.3),
            ("ALIGN", (2, 1), (2, -1), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.6, COLOR_BORDER),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COLOR_CREAM]),
        ]
    )
    table.setStyle(table_style)
    return table


def _draw_totals_block(pdf: canvas.Canvas, invoice, width: float, y_top: float) -> float:
    has_discount = float(invoice.price_discount or 0) > 0
    box_width = 2.4 * inch
    box_height = 1.05 * inch if has_discount else 0.86 * inch
    box_x = width - PAGE_MARGIN_X - box_width
    box_y = y_top - box_height

    pdf.setStrokeColor(COLOR_SAGE)
    pdf.setFillColor(colors.white)
    pdf.setLineWidth(1.2)
    pdf.roundRect(box_x, box_y, box_width, box_height, 10, fill=1, stroke=1)

    text_x = box_x + 0.14 * inch
    text_y = box_y + box_height - 0.22 * inch

    pdf.setFont("Helvetica", 9.5)
    pdf.setFillColor(COLOR_TEXT)
    pdf.drawString(text_x, text_y, f"Subtotal: {currency}{invoice.price_subtotal:.2f}")
    text_y -= 0.2 * inch
    if has_discount:
        pdf.drawString(text_x, text_y, f"Discount: -{currency}{invoice.price_discount:.2f}")
        text_y -= 0.22 * inch
    else:
        text_y -= 0.02 * inch

    pdf.setStrokeColor(COLOR_BORDER)
    pdf.setLineWidth(0.8)
    pdf.line(text_x, text_y, box_x + box_width - 0.14 * inch, text_y)
    text_y -= 0.18 * inch
    pdf.setFont("Helvetica-Bold", 11)
    pdf.setFillColor(COLOR_ACCENT)
    pdf.drawString(text_x, text_y, f"Total: {currency}{invoice.price_total:.2f}")

    return box_y - 0.24 * inch


def _draw_payment_blocks(pdf: canvas.Canvas, y_top: float, width: float) -> float:
    block_gap = 0.22 * inch
    block_width = (width - (2 * PAGE_MARGIN_X) - block_gap) / 2
    block_height = 1.95 * inch
    left_x = PAGE_MARGIN_X
    right_x = left_x + block_width + block_gap
    block_y = y_top - block_height

    for x in (left_x, right_x):
        pdf.setStrokeColor(COLOR_BORDER)
        pdf.setFillColor(colors.white)
        pdf.setLineWidth(1)
        pdf.roundRect(x, block_y, block_width, block_height, 10, fill=1, stroke=1)

    # Bank details
    text_x = left_x + 0.14 * inch
    text_y = block_y + block_height - 0.22 * inch
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(COLOR_NAVY)
    pdf.drawString(text_x, text_y, "Bank Details")
    pdf.setFont("Helvetica", 9.2)
    pdf.setFillColor(COLOR_TEXT)
    text_y -= 0.2 * inch
    pdf.drawString(text_x, text_y, "Account Name: London W4lkies Ltd")
    text_y -= 0.18 * inch
    pdf.drawString(text_x, text_y, f"Sort Code: {server_bank_sort_code}")
    text_y -= 0.18 * inch
    pdf.drawString(text_x, text_y, f"Account Number: {server_bank_account_number}")
    text_y -= 0.18 * inch
    pdf.drawString(text_x, text_y, "Bank Name: Revolut")

    # Other payment methods
    text_x = right_x + 0.14 * inch
    text_y = block_y + block_height - 0.22 * inch
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(COLOR_NAVY)
    pdf.drawString(text_x, text_y, "Other Payment Methods")

    pdf.setFont("Helvetica", 9.2)
    pdf.setFillColor(COLOR_TEXT)
    text_y -= 0.2 * inch
    pdf.drawString(text_x, text_y, "Cash: Pay in person")

    if invoice_payment_request:
        text_y -= 0.2 * inch
        pdf.drawString(text_x, text_y, invoice_payment_request)

    return block_y - 0.32 * inch


def _draw_footer(pdf: canvas.Canvas, width: float, y: float) -> None:
    center_x = width / 2
    pdf.setFillColor(COLOR_NAVY)
    pdf.setFont("Helvetica-Bold", 10.5)
    pdf.drawCentredString(center_x, y, "THANK YOU FOR YOUR BUSINESS")
    y -= 0.2 * inch
    pdf.setFont("Helvetica", 8.8)
    pdf.setFillColor(COLOR_MUTED)
    pdf.drawCentredString(center_x, y, f"{server_url} · {server_email}")


def _page_break(pdf: canvas.Canvas, invoice, width: float, height: float) -> float:
    pdf.showPage()
    return _draw_header(pdf, invoice, width, height)


def _create(invoice):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = _draw_header(pdf, invoice, width, height)
    y = _draw_bill_to_block(pdf, invoice, width, y)

    booking_chunks = chunk_bookings(list(invoice.bookings))
    if not booking_chunks:
        booking_chunks = [[]]

    for bookings in booking_chunks:
        table = _build_bookings_table(bookings)
        _, table_height = table.wrapOn(pdf, width - 2 * PAGE_MARGIN_X, height)
        # Keep line items on page 1 whenever the table physically fits; let
        # totals/payment move to the next page if needed.
        if y - table_height < PAGE_MARGIN_BOTTOM + 0.25 * inch:
            y = _page_break(pdf, invoice, width, height)
            y = _draw_bill_to_block(pdf, invoice, width, y)

        table_x = (width - table._width) / 2
        y -= table_height
        table.drawOn(pdf, table_x, y)
        y -= 0.2 * inch

    if y < PAGE_MARGIN_BOTTOM + 2.7 * inch:
        y = _page_break(pdf, invoice, width, height)
        y = _draw_bill_to_block(pdf, invoice, width, y)

    y = _draw_totals_block(pdf, invoice, width, y)

    if y < PAGE_MARGIN_BOTTOM + 2.4 * inch:
        y = _page_break(pdf, invoice, width, height)
        y = _draw_bill_to_block(pdf, invoice, width, y)

    y = _draw_payment_blocks(pdf, y, width)
    _draw_footer(pdf, width, max(y, PAGE_MARGIN_BOTTOM))

    pdf.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()

    pdf_file = BytesIO()
    pdf_file.write(pdf_bytes)
    pdf_file.seek(0)

    customer_name = invoice.customer.name
    year_issued = invoice.date_issued.strftime("%Y")
    month_issued = invoice.date_issued.strftime("%B")
    pdf_filepath = f"{customer_name} {year_issued} {month_issued}.pdf"
    return pdf_file, pdf_filepath


def chunk_bookings(bookings: list) -> list:
    services_per_page = 18
    chunks = []
    while bookings:
        chunks.append(bookings[:services_per_page])
        bookings = bookings[services_per_page:]
    return chunks


def create(invoice):
    pdf_file, pdf_filepath = _create(invoice)
    return pdf_file, pdf_filepath
