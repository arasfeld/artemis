export interface WelcomeTemplateData {
  firstName: string;
}

export interface TemplateResult {
  html: string;
  subject: string;
  text: string;
}

export function welcomeTemplate(data: WelcomeTemplateData): TemplateResult {
  const { firstName } = data;

  const subject = `Welcome to Artemis, ${firstName}!`;

  const text = `
Hi ${firstName},

Welcome to Artemis! We're excited to have you join our community.

Your profile is all set up and you're ready to start discovering new connections.

Here are a few tips to get started:
- Add more photos to your profile to increase your visibility
- Be genuine in your bio and conversations
- Take your time getting to know people

Happy connecting!

The Artemis Team
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">Artemis</h1>
  </div>

  <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="margin-top: 0;">Hi ${firstName},</h2>

    <p>Welcome to Artemis! We're excited to have you join our community.</p>

    <p>Your profile is all set up and you're ready to start discovering new connections.</p>
  </div>

  <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
    <h3 style="margin-top: 0; color: #6366f1;">Here are a few tips to get started:</h3>
    <ul style="padding-left: 20px;">
      <li>Add more photos to your profile to increase your visibility</li>
      <li>Be genuine in your bio and conversations</li>
      <li>Take your time getting to know people</li>
    </ul>
  </div>

  <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
    <p>Happy connecting!</p>
    <p><strong>The Artemis Team</strong></p>
  </div>
</body>
</html>
`.trim();

  return { html, subject, text };
}
