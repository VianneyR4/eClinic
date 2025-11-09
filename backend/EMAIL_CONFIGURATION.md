# Email Configuration Guide

## Gmail SMTP Setup

The application uses Gmail SMTP for sending verification emails. Follow these steps to configure:

### 1. Environment Variables

Add the following to your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=vianneyrwicha2017@gmail.com
MAIL_PASSWORD=tgeqhuwujwlqdwaz
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=vianneyrwicha2017@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 2. Gmail App Password

The password `tgeqhuwujwlqdwaz` is a Gmail App Password. If you need to generate a new one:

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to App passwords
5. Generate a new app password for "Mail"
6. Use the generated password in your `.env` file

### 3. Laravel Mail Configuration

Laravel 11 automatically reads from `.env` file. The configuration is set in `config/mail.php` (if it exists) or uses defaults.

### 4. Testing Email Configuration

Test your email configuration by:

```bash
# In Docker container
docker-compose exec app php artisan tinker

# Then in tinker
Mail::raw('Test email', function($message) {
    $message->to('your-email@example.com')
            ->subject('Test Email');
});
```

### 5. Troubleshooting

**Email not sending?**
- Check that `MAIL_MAILER=smtp` in `.env`
- Verify Gmail app password is correct
- Ensure 2-Step Verification is enabled on Gmail account
- Check Laravel logs: `storage/logs/laravel.log`

**Connection timeout?**
- Verify firewall allows outbound SMTP (port 587)
- Check if your hosting provider blocks SMTP ports
- Try using port 465 with `MAIL_ENCRYPTION=ssl`

### 6. Production Considerations

For production:
- Use environment-specific email service (SendGrid, Mailgun, AWS SES)
- Store sensitive credentials in secure environment variables
- Use queue for email sending to avoid blocking requests
- Monitor email delivery rates

## Queue Configuration (Optional)

To send emails asynchronously:

1. Install queue driver (Redis recommended):
```bash
composer require predis/predis
```

2. Update `.env`:
```env
QUEUE_CONNECTION=redis
```

3. Run queue worker:
```bash
php artisan queue:work
```

## Email Templates

Email templates are located in `resources/views/emails/`:
- `verification-code.blade.php` - Email verification code template

To customize templates, edit the Blade files in that directory.

