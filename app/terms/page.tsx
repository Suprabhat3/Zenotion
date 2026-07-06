import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The rules for using Zenotion — your account, your content, acceptable use, AI features, sharing, and our responsibilities.",
};

const CONTACT_EMAIL = "suprrabhat.work@gmail.com";
const LAST_UPDATED = "July 6, 2026";

const SECTIONS: LegalSection[] = [
  {
    title: "Acceptance of these terms",
    content: (
      <p>
        These Terms &amp; Conditions govern your use of Zenotion (
        {siteConfig.url}), a free, markdown-first note-taking platform. By
        creating an account, signing in (including with Google), or using the
        service, you agree to these terms and to our{" "}
        <Link href="/privacy" className="link-underline-grow font-medium text-foreground">
          Privacy Policy
        </Link>
        . If you do not agree, please do not use Zenotion.
      </p>
    ),
  },
  {
    title: "The service",
    content: (
      <>
        <p>Zenotion provides:</p>
        <ul>
          <li>An authenticated personal workspace for writing and organizing markdown notes.</li>
          <li>Folders, tags, autosave, and note version history.</li>
          <li>Public share links for notes you explicitly choose to publish.</li>
          <li>Image uploads for note content, icons, and covers.</li>
          <li>
            Optional AI note assistance (summarize, rewrite, translate, and
            similar actions) powered by API keys you bring yourself.
          </li>
        </ul>
        <p>
          Zenotion is <strong>free of charge</strong>. There are no paid plans,
          and we may add, change, or remove features as the product evolves.
        </p>
      </>
    ),
  },
  {
    title: "Your account",
    content: (
      <ul>
        <li>
          You must provide accurate information when creating an account and
          keep your credentials confidential.
        </li>
        <li>
          You are responsible for all activity that happens under your
          account.
        </li>
        <li>
          You must be at least 13 years old (or the minimum age required in
          your country) to use Zenotion.
        </li>
        <li>
          Notify us at {CONTACT_EMAIL} if you suspect unauthorized access to
          your account.
        </li>
      </ul>
    ),
  },
  {
    title: "Your content",
    content: (
      <>
        <p>
          <strong>You own your notes.</strong> Zenotion claims no ownership of
          the content you create. You grant us only the limited license needed
          to store, display, and back up your content so we can provide the
          service to you.
        </p>
        <p>
          Notes are private by default. When you enable a public share link,
          you make that note readable by anyone with the link — you can turn
          sharing off at any time.
        </p>
      </>
    ),
  },
  {
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to use Zenotion to:</p>
        <ul>
          <li>Store or publicly share content that is illegal, infringing, or malicious (including malware or phishing material).</li>
          <li>Harass, defame, or violate the rights or privacy of others.</li>
          <li>Attempt to access other users&apos; accounts, notes, or data.</li>
          <li>Probe, disrupt, overload, or reverse-engineer the service or its APIs.</li>
          <li>Send spam or use the platform for bulk unsolicited content.</li>
        </ul>
        <p>
          We may remove content or suspend accounts that violate these rules,
          especially content published through public share links.
        </p>
      </>
    ),
  },
  {
    title: "AI features and bring-your-own-key",
    content: (
      <ul>
        <li>
          AI actions run using <strong>your own API key</strong> from a
          supported provider (OpenAI, Gemini, Anthropic, Groq, or OpenRouter).
          Your key is stored in your browser, not on our servers.
        </li>
        <li>
          You are responsible for any charges your AI provider bills you and
          for complying with that provider&apos;s terms of service.
        </li>
        <li>
          AI-generated output can be inaccurate. Review results before relying
          on them — you are responsible for content you keep or publish.
        </li>
      </ul>
    ),
  },
  {
    title: "Service availability",
    content: (
      <p>
        We aim to keep Zenotion reliable, with autosave and version history
        protecting your work. However, the service is provided free of charge
        and we do not guarantee uninterrupted availability. We recommend
        keeping copies of business-critical content. We may modify or
        discontinue the service, and where reasonably possible we will give
        notice so you can export your notes.
      </p>
    ),
  },
  {
    title: "Termination",
    content: (
      <p>
        You may stop using Zenotion and request deletion of your account at
        any time by emailing {CONTACT_EMAIL}. We may suspend or terminate
        accounts that violate these terms or that pose a security risk. On
        termination, your data is deleted in line with our Privacy Policy.
      </p>
    ),
  },
  {
    title: "Disclaimer of warranties",
    content: (
      <p>
        Zenotion is provided <strong>&quot;as is&quot; and &quot;as
        available&quot;</strong>, without warranties of any kind, express or
        implied, including fitness for a particular purpose, accuracy of
        AI-generated content, or uninterrupted, error-free operation.
      </p>
    ),
  },
  {
    title: "Limitation of liability",
    content: (
      <p>
        To the maximum extent permitted by law, Zenotion and its creator will
        not be liable for indirect, incidental, special, or consequential
        damages — including loss of data, profits, or goodwill — arising from
        your use of, or inability to use, the service.
      </p>
    ),
  },
  {
    title: "Intellectual property",
    content: (
      <p>
        The Zenotion name, logo, design, and software are owned by the
        Zenotion project. These terms do not grant you any right to use our
        branding. Your content remains yours, as described above.
      </p>
    ),
  },
  {
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms as the product evolves. When we do, we will
        update the &quot;Last updated&quot; date on this page. Continued use of
        Zenotion after changes take effect means you accept the revised terms.
      </p>
    ),
  },
  {
    title: "Contact",
    content: (
      <p>
        Questions about these terms? Email us at{" "}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="The plain-language rules for using Zenotion — what you can expect from us, and what we expect from you."
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
    />
  );
}
