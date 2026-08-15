/**
 * Email delivery architecture for Stavia notifications.
 *
 * The in-app `notifications` table (see supabase/migrations/001_initial_schema.sql)
 * is always written to immediately by server actions — that part works today
 * with zero configuration. This module additionally *emails* the same event
 * once you connect a provider.
 *
 * To activate:
 *   1. Create a free account at https://resend.com
 *   2. Verify a sending domain (or use their shared onboarding domain for testing)
 *   3. Add RESEND_API_KEY to your environment variables
 *   4. npm install resend
 *   5. Uncomment the Resend call below
 *
 * Until then, sendEmail() safely no-ops (logs to the server console in dev)
 * instead of throwing, so the rest of the app works normally without it.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email:not-configured] Would send "${subject}" to ${to}. Set RESEND_API_KEY to enable delivery.`);
    return { sent: false };
  }

  // Uncomment once `resend` is installed and RESEND_API_KEY is set:
  //
  // const { Resend } = await import('resend');
  // const resend = new Resend(apiKey);
  // await resend.emails.send({
  //   from: 'Stavia <notifications@yourdomain.com>',
  //   to,
  //   subject,
  //   html,
  // });
  // return { sent: true };

  return { sent: false };
}

export const emailTemplates = {
  propertySubmitted: (propertyName: string) => ({
    subject: 'הנכס שלכם התקבל ונמצא בבדיקה',
    html: `<p>שלום,</p><p>קיבלנו את הנכס <strong>${propertyName}</strong> וצוות סטאביה יבדוק אותו בהקדם.</p>`,
  }),
  propertyApproved: (propertyName: string) => ({
    subject: 'הנכס שלכם אושר!',
    html: `<p>מזל טוב! <strong>${propertyName}</strong> אושר וכעת גלוי לציבור באתר סטאביה.</p>`,
  }),
  propertyRejected: (propertyName: string, reason: string) => ({
    subject: 'עדכון לגבי הנכס שלכם',
    html: `<p>הנכס <strong>${propertyName}</strong> לא אושר בשלב זה.</p><p>סיבה: ${reason}</p>`,
  }),
  changesRequested: (propertyName: string, reason: string) => ({
    subject: 'נדרשים שינויים בנכס שלכם',
    html: `<p>לפני אישור <strong>${propertyName}</strong>, נא לבצע את השינויים הבאים:</p><p>${reason}</p>`,
  }),
  newInquiry: (propertyName: string, guestName: string) => ({
    subject: `פנייה חדשה על ${propertyName}`,
    html: `<p>${guestName} שלחו לכם פנייה חדשה על הנכס <strong>${propertyName}</strong>. היכנסו לדשבורד לפרטים.</p>`,
  }),
};
