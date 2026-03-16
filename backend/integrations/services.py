import email
import imaplib
import smtplib
from email.header import decode_header
from email.message import EmailMessage
from email.utils import parseaddr

from core.models import AISuggestion, Customer, Ticket

from .models import GmailIntegration, GmailTicketThread


def _decoded_header(value: str | None) -> str:
    if not value:
        return ''
    decoded_parts = decode_header(value)
    output: list[str] = []
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            output.append(part.decode(encoding or 'utf-8', errors='ignore'))
        else:
            output.append(part)
    return ''.join(output)


def validate_gmail_credentials(integration: GmailIntegration) -> None:
    client = imaplib.IMAP4_SSL(integration.imap_host, integration.imap_port)
    try:
        client.login(integration.email, integration.app_password)
    finally:
        client.logout()


def _extract_text_payload(message: email.message.Message) -> str:
    if message.is_multipart():
        for part in message.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get('Content-Disposition', ''))
            if content_type == 'text/plain' and 'attachment' not in content_disposition:
                charset = part.get_content_charset() or 'utf-8'
                payload = part.get_payload(decode=True) or b''
                return payload.decode(charset, errors='ignore').strip()
    payload = message.get_payload(decode=True) or b''
    charset = message.get_content_charset() or 'utf-8'
    return payload.decode(charset, errors='ignore').strip()


def _guess_category(message_text: str, subject: str) -> str:
    text = f'{subject} {message_text}'.lower()
    if 'invoice' in text or 'billing' in text or 'payment' in text:
        return Ticket.Category.BILLING
    if 'password' in text or 'login' in text or 'account' in text:
        return Ticket.Category.ACCOUNT
    if 'timeout' in text or 'error' in text or 'api' in text or 'bug' in text:
        return Ticket.Category.TECHNICAL
    return Ticket.Category.GENERAL


def sync_gmail_tickets(integration: GmailIntegration, limit: int = 25) -> dict[str, int]:
    created_tickets = 0
    skipped = 0

    client = imaplib.IMAP4_SSL(integration.imap_host, integration.imap_port)
    try:
        client.login(integration.email, integration.app_password)
        client.select('INBOX')
        _, data = client.search(None, 'ALL')
        message_ids = data[0].split()[-limit:]

        for message_id in reversed(message_ids):
            _, fetched = client.fetch(message_id, '(RFC822)')
            if not fetched or not fetched[0]:
                skipped += 1
                continue

            raw_email = fetched[0][1]
            parsed_message = email.message_from_bytes(raw_email)
            message_header_id = parsed_message.get('Message-ID', '').strip()
            if not message_header_id:
                skipped += 1
                continue
            if GmailTicketThread.objects.filter(gmail_message_id=message_header_id).exists():
                skipped += 1
                continue

            from_name, from_email = parseaddr(parsed_message.get('From', ''))
            if not from_email:
                skipped += 1
                continue
            subject = _decoded_header(parsed_message.get('Subject', 'No subject')) or 'No subject'
            message_text = _extract_text_payload(parsed_message) or '(No body)'

            customer, _ = Customer.objects.get_or_create(
                email=from_email,
                defaults={
                    'name': from_name or from_email.split('@')[0],
                    'company': '',
                },
            )
            ticket = Ticket.objects.create(
                customer=customer,
                subject=subject,
                message=message_text[:4000],
                status=Ticket.Status.OPEN,
                category=_guess_category(message_text, subject),
            )
            GmailTicketThread.objects.create(
                ticket=ticket,
                gmail_message_id=message_header_id,
                from_email=from_email,
                to_email=integration.email,
                subject=subject[:255],
            )
            AISuggestion.objects.create(
                ticket=ticket,
                suggested_reply=(
                    'Thanks for reaching out. We have received your request and '
                    'are reviewing the issue. We will share a confirmed update shortly.'
                ),
                confidence=0.82,
            )
            created_tickets += 1
    finally:
        client.logout()

    return {'created_tickets': created_tickets, 'skipped': skipped}


def send_gmail_reply(integration: GmailIntegration, to_email: str, subject: str, reply_text: str) -> None:
    message = EmailMessage()
    message['Subject'] = f'Re: {subject}'
    message['From'] = integration.email
    message['To'] = to_email
    message.set_content(reply_text)

    with smtplib.SMTP_SSL(integration.smtp_host, integration.smtp_port) as server:
        server.login(integration.email, integration.app_password)
        server.send_message(message)
