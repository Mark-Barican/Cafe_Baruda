import Link from "next/link";
import { FaMugHot } from "react-icons/fa6";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/pos", label: "POS" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">
          <FaMugHot aria-hidden />
          <span>Roast &amp; Bloom</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
