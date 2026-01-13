"""
Email Service
Handles sending notifications for approvals, responses, and system events
"""

import os
from typing import Optional, List
from datetime import datetime

from config import get_settings

settings = get_settings()

# Try to import sendgrid, fall back to print if not available
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False


class EmailService:
    def __init__(self):
        self.api_key = getattr(settings, 'sendgrid_api_key', None) or os.environ.get('SENDGRID_API_KEY')
        self.from_email = getattr(settings, 'from_email', None) or os.environ.get('FROM_EMAIL', 'noreply@consultationsuite.com')
        self.enabled = SENDGRID_AVAILABLE and bool(self.api_key)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send an email using SendGrid."""
        if not self.enabled:
            print(f"[EMAIL] Would send to {to_email}: {subject}")
            print(f"[EMAIL] Content: {html_content[:200]}...")
            return True

        try:
            message = Mail(
                from_email=Email(self.from_email, "Consultation Suite"),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )

            if plain_content:
                message.add_content(Content("text/plain", plain_content))

            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            return response.status_code in [200, 201, 202]

        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send email: {e}")
            return False

    async def send_approval_request(
        self,
        approver_email: str,
        approver_name: str,
        query_subject: str,
        submitter_name: str,
        response_preview: str,
        approval_url: str,
        project_name: str
    ) -> bool:
        """Send approval request notification."""
        subject = f"[Action Required] Response awaiting your approval - {project_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .footer {{ background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .preview {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0; }}
                .meta {{ color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">Approval Required</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">A response is waiting for your review</p>
                </div>
                <div class="content">
                    <p>Hi {approver_name},</p>
                    <p>A response to a stakeholder query requires your approval before it can be sent.</p>

                    <div class="meta">
                        <strong>Project:</strong> {project_name}<br>
                        <strong>Query from:</strong> {submitter_name}<br>
                        <strong>Subject:</strong> {query_subject}
                    </div>

                    <div class="preview">
                        <strong>Response Preview:</strong><br>
                        {response_preview[:300]}{'...' if len(response_preview) > 300 else ''}
                    </div>

                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{approval_url}" class="button">Review & Approve</a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from Consultation Suite.</p>
                    <p>You received this because you are an approver for {project_name}.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(approver_email, subject, html_content)

    async def send_approval_decision(
        self,
        author_email: str,
        author_name: str,
        decision: str,  # approved, changes_requested, rejected
        query_subject: str,
        approver_name: str,
        comments: Optional[str],
        project_name: str,
        dashboard_url: str
    ) -> bool:
        """Send notification when approval decision is made."""
        decision_labels = {
            'approved': ('Approved', '#22c55e', 'Your response has been approved and is ready to send.'),
            'changes_requested': ('Changes Requested', '#f97316', 'The approver has requested changes to your response.'),
            'rejected': ('Rejected', '#dc2626', 'Your response has been rejected.')
        }

        label, color, message = decision_labels.get(decision, ('Updated', '#6b7280', 'Status updated.'))
        subject = f"[{label}] Response for: {query_subject}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: {color}; color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .footer {{ background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .comments {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid {color}; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">{label}</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">{message}</p>
                </div>
                <div class="content">
                    <p>Hi {author_name},</p>
                    <p>{message}</p>

                    <p><strong>Query:</strong> {query_subject}<br>
                    <strong>Decision by:</strong> {approver_name}<br>
                    <strong>Project:</strong> {project_name}</p>

                    {f'<div class="comments"><strong>Comments:</strong><br>{comments}</div>' if comments else ''}

                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{dashboard_url}" class="button">View in Dashboard</a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from Consultation Suite.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(author_email, subject, html_content)

    async def send_new_query_notification(
        self,
        team_emails: List[str],
        query_subject: str,
        submitter_name: str,
        submitter_email: str,
        query_preview: str,
        project_name: str,
        dashboard_url: str
    ) -> bool:
        """Send notification when new query is submitted."""
        subject = f"[New Query] {query_subject or 'New feedback received'} - {project_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .footer {{ background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }}
                .button {{ display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
                .preview {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">New Query Received</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">{project_name}</p>
                </div>
                <div class="content">
                    <p><strong>From:</strong> {submitter_name or 'Anonymous'} {f'({submitter_email})' if submitter_email else ''}</p>
                    <p><strong>Subject:</strong> {query_subject or 'No subject'}</p>

                    <div class="preview">
                        {query_preview[:500]}{'...' if len(query_preview) > 500 else ''}
                    </div>

                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{dashboard_url}" class="button">View & Respond</a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from Consultation Suite.</p>
                </div>
            </div>
        </body>
        </html>
        """

        success = True
        for email in team_emails:
            result = await self.send_email(email, subject, html_content)
            if not result:
                success = False

        return success

    async def send_response_to_submitter(
        self,
        submitter_email: str,
        submitter_name: str,
        query_subject: str,
        response_content: str,
        project_name: str,
        contact_email: Optional[str] = None
    ) -> bool:
        """Send the approved response to the original submitter."""
        subject = f"Re: {query_subject or 'Your feedback'} - {project_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; }}
                .footer {{ background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #6b7280; }}
                .response {{ line-height: 1.8; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">{project_name}</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Response to your enquiry</p>
                </div>
                <div class="content">
                    <p>Dear {submitter_name or 'Sir/Madam'},</p>
                    <p>Thank you for your feedback regarding <strong>{query_subject or 'the consultation'}</strong>.</p>

                    <div class="response">
                        {response_content.replace(chr(10), '<br>')}
                    </div>

                    {f'<p>If you have any further questions, please contact us at <a href="mailto:{contact_email}">{contact_email}</a>.</p>' if contact_email else ''}

                    <p>Kind regards,<br>The {project_name} Team</p>
                </div>
                <div class="footer">
                    <p>This email was sent in response to your consultation feedback.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(submitter_email, subject, html_content)


# Singleton instance
email_service = EmailService()
