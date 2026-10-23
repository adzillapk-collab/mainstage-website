// The legal pages: Terms, Privacy and Refunds (terms.html, privacy.html, refunds.html).
// Written from how the site and the service actually work. Not legal advice:
// have them checked before launch, and update "Payments" once a payment provider is chosen.

export type LegalDoc = {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

const CONTACT = 'getmainstage@gmail.com'
const UPDATED = '23 October 2026'

export const legal: Record<'privacy' | 'terms' | 'refunds', LegalDoc> = {
  privacy: {
    title: 'Privacy policy',
    updated: UPDATED,
    intro:
      'This explains what Main Stage collects when you visit our website or work with us, why, and what you can ask us to do with it. Main Stage is a video editing service based in Pakistan. If anything here is unclear, email us at ' + CONTACT + '.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you fill in the form on our site: your name, your email address and your LinkedIn profile link, plus which button you clicked and the page you were on, so we know what you were interested in.',
          'When you work with us: the footage, audio, brand guidelines and other files you send, and our messages and feedback with you.',
          'When you pay: billing details such as your name, email and what you bought. Card or bank details are handled by the payment provider we use, not stored by us.',
          'When you browse the site: our hosting provider (Cloudflare) handles basic technical information such as your IP address and browser, to deliver the pages and keep the site secure. We don’t use advertising or tracking cookies, and we don’t run analytics that follow you around the web.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'To reply to your enquiry and talk to you about our service.',
          'To edit your reels, deliver them and handle your revisions.',
          'To send invoices, keep business records and meet our legal obligations.',
          'We don’t sell your information, and we don’t send marketing emails unless you’ve asked for them.',
        ],
      },
      {
        heading: 'Your footage',
        body: [
          'We use the footage and files you send only to make your reels. We don’t share them with anyone outside the people working on your project, and we don’t publish them.',
          'We only show a reel we made for you in our portfolio, including on this website, if you’ve said we can. You can ask us to take it down at any time.',
        ],
      },
      {
        heading: 'Who else handles your information',
        body: [
          'We use a few trusted services to run Main Stage: Cloudflare to host the website and our video files, Google (Gmail and Google Sheets) to receive and keep track of enquiries, file-sharing tools to receive your footage, and a payment provider to take payments. They only process your information to provide their service to us.',
          'Some of these services store data outside Pakistan, including in the United States and Europe.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'We keep enquiries for as long as we’re in touch about working together, and project files for as long as we need them to deliver and support your reels. Billing records are kept for as long as the law requires. You can ask us to delete your information sooner, and we will, unless we have to keep it by law.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'You can ask us to show you the information we hold about you, correct it, delete it, or stop using it. Email ' + CONTACT + ' and we’ll reply within 30 days. If you’re in the UK or the EU, you also have rights under data protection law there, and we’ll honour them.',
        ],
      },
      {
        heading: 'Children',
        body: ['Our service is for businesses and adults. We don’t knowingly collect information from anyone under 16.'],
      },
      {
        heading: 'Changes',
        body: ['If we change this policy, we’ll update it here and change the date at the top.'],
      },
    ],
  },

  terms: {
    title: 'Terms of service',
    updated: UPDATED,
    intro:
      'These terms cover how Main Stage works with you when you buy reels from us. By buying a pack or a trial reel, you agree to them. Questions? Email ' + CONTACT + '.',
    sections: [
      {
        heading: 'What we do',
        body: [
          'Main Stage edits short-form videos (reels) from footage you record and send us. What each plan includes is shown on our pricing section when you buy.',
        ],
      },
      {
        heading: 'Plans and payment',
        body: [
          'Prices are in US dollars. You pay for a pack upfront, before we start work. We’ll agree the payment method with you when you sign up.',
          'Plans renew automatically at the end of each billing period until you cancel. You can cancel at any time by emailing us before your next renewal; cancelling stops future payments.',
          'A trial reel is a single edit made exactly as we would for a pack. If you go on to buy a pack, what you paid for the trial comes off your first payment.',
        ],
      },
      {
        heading: 'Your footage and content',
        body: [
          'You confirm that you own, or have permission to use, everything you send us: footage, voice, music, logos, images and anything else. You’re responsible for what your reels say and claim.',
          'We can decline to edit content that is unlawful, misleading, hateful or that we’re not comfortable working on. If we decline before starting, we won’t charge for that reel.',
        ],
      },
      {
        heading: 'Revisions',
        body: [
          'Each reel includes two rounds of small fixes. Small fixes are changes within the direction we agreed, such as timing, a caption, a graphic or a cut. A brand-new direction, or new footage, counts as a new reel.',
        ],
      },
      {
        heading: 'Timing',
        body: [
          'We agree timing with you for each reel and keep you updated as we go. Timing depends on getting your footage, brief and feedback; if those arrive late, delivery moves with them.',
        ],
      },
      {
        heading: 'Who owns the reels',
        body: [
          'Once you’ve paid in full, the finished reels are yours to post and use wherever you like. Any stock music, footage or graphics we add are licensed for use in that reel.',
          'We keep the rights to our own templates, project files, methods and tools. We only show your reel in our portfolio if you’ve said we can.',
        ],
      },
      {
        heading: 'Confidentiality',
        body: ['We keep your footage, plans and business information private and only use them to make your reels.'],
      },
      {
        heading: 'Refunds',
        body: ['Payments are non-refundable. See our refund policy for details.'],
      },
      {
        heading: 'Liability',
        body: [
          'We do our best to deliver great work on time, but we can’t guarantee results such as views, followers or sales. As far as the law allows, our total responsibility to you for any reel is limited to what you paid for it.',
        ],
      },
      {
        heading: 'Law',
        body: ['These terms are governed by the laws of Pakistan, and any dispute will be handled by the courts of Pakistan.'],
      },
      {
        heading: 'Changes',
        body: ['If we change these terms, we’ll update them here and change the date at the top. Changes don’t affect a pack you’ve already paid for.'],
      },
    ],
  },

  refunds: {
    title: 'Refund policy',
    updated: UPDATED,
    intro:
      'We keep things simple: payments aren’t refundable, and instead we work with you until each reel is right. Here’s exactly what that means.',
    sections: [
      {
        heading: 'All payments are final',
        body: [
          'Packs, renewals and trial reels are non-refundable once paid, including reels you haven’t used yet.',
        ],
      },
      {
        heading: 'We fix it instead',
        body: [
          'Every reel includes two rounds of small fixes. If something isn’t right, tell us what to change and we’ll revise it within the direction we agreed.',
        ],
      },
      {
        heading: 'Trial reels',
        body: [
          'A trial reel isn’t refundable, but if you buy a pack afterwards, what you paid for the trial comes off your first payment.',
        ],
      },
      {
        heading: 'If we can’t deliver',
        body: [
          'If we’re ever unable to deliver a reel you’ve paid for because of something on our side, we’ll refund that reel.',
        ],
      },
      {
        heading: 'Cancelling',
        body: [
          'You can cancel your plan at any time by emailing ' + CONTACT + ' before your next renewal. Cancelling stops future payments; it doesn’t refund the current period.',
        ],
      },
      {
        heading: 'Questions',
        body: ['If you’re unhappy with anything, email us before raising a dispute with your bank or payment provider, and we’ll do our best to sort it out.'],
      },
    ],
  },
}
