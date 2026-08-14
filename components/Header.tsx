import Link from "next/link";
import { getCurrentProfile } from "@/lib/access";
import { SITE } from "@/lib/siteConfig";
import Icon from "./Icon";
import OmniSearch from "./OmniSearch";
import MobileNav from "./MobileNav";

export default async function Header() {
  const profile = await getCurrentProfile();
  const dashboardHref =
    profile?.role === "admin" ? "/admin" : profile?.role === "producer" ? "/producer/dashboard" : "/dashboard";

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="logo shrink-0">
          <span className="mark"><Icon name="spark" /></span>
          <span>{SITE.name}</span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          <Link href="/#inside" className="navlink">What members get</Link>
          <Link href="/join" className="navlink">Membership</Link>
          <Link href="/producers" className="navlink">For producers</Link>
          <Link href="/faq" className="navlink">FAQ</Link>
          <Link href="/contact" className="navlink">Contact</Link>
        </nav>

        <div className="flex items-center gap-2 md:ml-2 ml-auto">
          {profile && <OmniSearch />}
          {profile ? (
            <Link href={dashboardHref} className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link href="/join" className="btn btn-primary">Join</Link>
            </>
          )}
          <MobileNav loggedIn={!!profile} dashboardHref={dashboardHref} />
        </div>
      </div>
    </header>
  );
}
