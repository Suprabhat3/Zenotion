import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Zenotion collects, uses, and protects your data — accounts, notes, AI keys, cookies, and your rights.",
};

const CONTACT_EMAIL = "suprrabhat.work@gmail.com";
const LAST_UPDATED = "July 6, 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    content: (
      <p>
        Zenotion ({siteConfig.url}) is a free, markdown-first note-taking
        platform for developers. This Privacy Policy explains what information
        we collect when you use Zenotion, how we use it, and the choices you
        have. By creating an account or using the service, you agree to the
        practices described here.
      </p>
    ),
  },
  {
    title: "Information we collect",
    content: (
      <>
        <p>We collect only what we need to run the service:</p>
        <ul>
          <li>
            <strong>Account information.</strong> Your name, email address, and
            a securely hashed password when you sign up with email/password.
            If you sign in with Google, we receive your name, email address,
            and profile picture from Google — we never see your Google
            password.
          </li>
          <li>
            <strong>Content you create.</strong> Notes, note version history,
            folders, tags, note icons and cover images, and any images you
            upload into your notes.
          </li>
          <li>
            <strong>Sharing settings.</strong> Whether a note is public and
            its share link slug.
          </li>
          <li>
            <strong>Session data.</strong> Authentication cookies and session
            records (including IP address and browser user agent) used to keep
            you signed in securely.
          </li>
        </ul>
        <p>
          We do not collect payment information — Zenotion is free and has no
          paid plans.
        </p>
      </>
    ),
  },
  {
    title: "AI features and your API keys",
    content: (
      <>
        <p>
          Zenotion&apos;s AI features (summarize, rewrite, fix grammar,
          translate, and other note actions) are <strong>bring-your-own-key</strong>:
        </p>
        <ul>
          <li>
            Your AI provider API keys (OpenAI, Gemini, Anthropic, Groq,
            OpenRouter) are stored <strong>locally in your browser</strong> —
            they are never saved in our database.
          </li>
          <li>
            When you run an AI action, the relevant note content is sent to
            your chosen AI provider to generate the result. Their processing
            of that content is governed by that provider&apos;s own privacy
            policy.
          </li>
          <li>
            We do not use your notes to train AI models, and we do not sell or
            share your content with advertisers.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How we use your information",
    content: (
      <ul>
        <li>To provide the core service: storing, syncing, and autosaving your notes.</li>
        <li>To authenticate you and keep your account secure.</li>
        <li>To serve public share pages for notes you explicitly make public.</li>
        <li>To respond to support requests you send us.</li>
        <li>To debug problems and keep the service reliable.</li>
      </ul>
    ),
  },
  {
    title: "Cookies",
    content: (
      <p>
        We use only <strong>essential cookies</strong> — session cookies set by
        our authentication system (Better Auth) to keep you signed in, and a
        preference for your light/dark theme. We do not use advertising or
        cross-site tracking cookies.
      </p>
    ),
  },
  {
    title: "How your data is stored and shared",
    content: (
      <>
        <p>
          Your data is stored in a PostgreSQL database and images are stored
          with our media hosting provider (ImageKit). We share data only with
          the service providers required to operate Zenotion:
        </p>
        <ul>
          <li>Database and application hosting providers.</li>
          <li>ImageKit, for storing and serving images you upload.</li>
          <li>Google, if you choose to sign in with Google.</li>
          <li>Your chosen AI provider, only when you run an AI action.</li>
        </ul>
        <p>
          We never sell your personal data. Notes are{" "}
          <strong>private by default</strong> and scoped to your account; a
          note becomes visible to others only if you explicitly enable its
          public share link.
        </p>
      </>
    ),
  },
  {
    title: "Data retention and deletion",
    content: (
      <>
        <p>
          We keep your account data and notes for as long as your account is
          active. You can delete individual notes, folders, and tags at any
          time from the app.
        </p>
        <p>
          To delete your entire account and all associated data, email us at{" "}
          <strong>{CONTACT_EMAIL}</strong> and we will remove it within 30
          days.
        </p>
      </>
    ),
  },
  {
    title: "Your rights",
    content: (
      <ul>
        <li>Access and export the content of your notes at any time.</li>
        <li>Correct your account details.</li>
        <li>Delete your content or your entire account.</li>
        <li>Revoke Google access from your Google account security settings.</li>
        <li>Remove your AI API keys at any time — they live only in your browser.</li>
      </ul>
    ),
  },
  {
    title: "Security",
    content: (
      <p>
        Passwords are stored hashed, all traffic is served over HTTPS, and
        every note, folder, and tag query is scoped to the authenticated
        owner. No method of transmission or storage is 100% secure, but we
        follow industry-standard practices to protect your data.
      </p>
    ),
  },
  {
    title: "Children's privacy",
    content: (
      <p>
        Zenotion is not directed at children under 13 (or the minimum age
        required in your country). We do not knowingly collect personal
        information from children. If you believe a child has created an
        account, contact us and we will delete it.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we
        will update the &quot;Last updated&quot; date at the top of this page.
        Continued use of Zenotion after changes means you accept the updated
        policy.
      </p>
    ),
  },
  {
    title: "Contact us",
    content: (
      <p>
        Questions about privacy or your data? Email us at{" "}
        <strong>{CONTACT_EMAIL}</strong>. See also our{" "}
        <Link href="/terms" className="link-underline-grow font-medium text-foreground">
          Terms &amp; Conditions
        </Link>
        .
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Your notes are yours. This policy explains exactly what data Zenotion collects, why, and the control you have over it."
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
    />
  );
}
