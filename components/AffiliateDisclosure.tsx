import { SITE } from "@/lib/siteConfig";
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--ink-3)] ${className}`}>
      Disclosure: some links below are affiliate links. {SITE.name} may earn a commission if
      you click through and make a purchase or sign up, at no extra cost to you.
    </p>
  );
}
