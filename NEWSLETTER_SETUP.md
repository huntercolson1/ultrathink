# Newsletter Email Setup Guide

This site includes an email newsletter signup form that sends notifications when new blog posts are published.

## Quick Setup with Buttondown (Recommended)

1. **Sign up for Buttondown**: Go to https://buttondown.email and create a free account
   - Free tier includes: 1,000 subscribers, unlimited emails

2. **Get your username**: After signing up, your username will be in your account URL (e.g., `buttondown.email/yourusername`)

3. **Update the form**: Edit `_includes/newsletter.html` and replace `YOUR_BUTTONDOWN_USERNAME` with your actual Buttondown username in two places:
   - Line 8: `action="https://buttondown.email/api/emails/embed-subscribe/YOUR_BUTTONDOWN_USERNAME"`
   - Line 11: `onsubmit="window.open('https://buttondown.email/YOUR_BUTTONDOWN_USERNAME', 'popupwindow')"`

4. **Set up RSS-to-Email**:
   - In Buttondown dashboard, go to Settings → RSS
   - Add your RSS feed URL: `https://huntercolson1.github.io/ultrathink/feed.xml`
   - Configure email frequency (immediate, daily digest, weekly digest)
   - Buttondown will automatically check your RSS feed and send emails when new posts are published

## Alternative: Mailchimp

If you prefer Mailchimp:

1. Sign up at https://mailchimp.com
2. Create an audience/list
3. Get your form action URL from Mailchimp's embed code
4. Replace the form in `_includes/newsletter.html` with Mailchimp's form code
5. Use Mailchimp's RSS-to-Email feature or Zapier to connect your RSS feed

## Alternative: GitHub Actions (Advanced)

You can set up a GitHub Action that:
- Monitors your RSS feed
- Sends emails via SendGrid, Mailgun, or similar service
- Requires API keys and more setup

## Testing

After setup:
1. Test the signup form on your homepage
2. Publish a test blog post
3. Verify subscribers receive the email notification

## Current Implementation

The newsletter signup form is displayed on:
- Homepage (`index.html`) - after the hero section

You can add it to other pages by including:
```liquid
{% include newsletter.html %}
```

