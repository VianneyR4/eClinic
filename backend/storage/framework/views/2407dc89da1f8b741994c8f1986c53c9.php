<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(38deg, rgba(46, 55, 164, 1) 0%, rgba(87, 199, 133, 1) 98%, rgba(145, 199, 87, 1) 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">eClinic</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
        
        <p>Hello <?php echo e($name); ?>,</p>
        
        <p>Thank you for signing in to eClinic. Please use the following verification code to verify your email address:</p>
        
        <div style="background: white; border: 2px dashed #2e37a4; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2e37a4;">
                <?php echo e($code); ?>

            </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            This code will expire in <strong>15 minutes</strong>.
        </p>
        
        <p style="color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © <?php echo e(date('Y')); ?> eClinic. All rights reserved.
        </p>
    </div>
</body>
</html>

<?php /**PATH /var/www/html/resources/views/emails/verification-code.blade.php ENDPATH**/ ?>