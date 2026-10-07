# @repo/email

Transactional email for Better Auth and product mail. Sending goes through [Resend](https://resend.com); templates are React Email components with `en` / `fa` copy from `@repo/i18n`.

In development, a missing `RESEND_API_KEY` prints the message to the server log instead of sending. Production needs `RESEND_API_KEY` and `EMAIL_FROM`.
