<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $name;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $name)
    {
        $this->code = $code;
        $this->name = $name;
    }

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this->subject('Email Verification Code - eClinic')
            ->view('emails.verification-code')
            ->with([
                'code' => $this->code,
                'name' => $this->name,
            ]);
    }
}

