import { Link } from 'react-router-dom';

import  Logo  from "../assets/logo.png";

const policies = [
  { label: 'Privacy Policy', path: '/policies/privacy' },
  { label: 'Terms of Use', path: '/policies/terms' },
  { label: 'Shipping & Returns', path: '/policies/shipping' },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-black mt-auto overflow-hidden">
      {/* rose petals SVG background */}
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
          <img src={Logo} alt="Color Smith" className="h-16 mb-4" />
            {/* <img src={logoImg} alt="Color Smith" className="w-20 h-20" /> */}
            
            <p className="text-white/70 text-sm">
              Color Smith is a leading provider of cosmetics raw materials and finished products. We offer a wide range of products, including nail lacquers, lipsticks, lip gloss, primers, eyeliners, mascara & more — multiple grades and colors.
            </p>
          </div>
          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Policies
            </h3>
            <ul className="space-y-2">
              {policies.map((p) => (
                <li key={p.path}>
                  <Link
                    to={p.path}
                    className="text-white/70 hover:text-amber-300 text-sm transition-colors"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>
                <a href="mailto:contact@colorsmith.com" className="hover:text-amber-300 transition-colors">
                  contact@colorsmith.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-amber-300 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li>B2B inquiries welcome</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Follow us
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-amber-300 transition-colors"
                  aria-label={s.label}
                >
                  <span className="sr-only">{s.label}</span>
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/15 text-center text-white/50 text-sm">
          &copy; {new Date().getFullYear()} Color Smith – Cosmetics Raw Materials & Finished Products
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }) {
  const className = 'w-6 h-6';
  if (name === 'linkedin') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (name === 'twitter') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === 'instagram') {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm0 5.108a3.605 3.605 0 100 7.21 3.605 3.605 0 000-7.21zm0 1.803a1.802 1.802 0 110 3.604 1.802 1.802 0 010-3.604z" clipRule="evenodd" />
        <path d="M12.315 18.75c-3.183 0-5.77-2.587-5.77-5.77 0-3.183 2.587-5.77 5.77-5.77 3.183 0 5.77 2.587 5.77 5.77 0 3.183-2.587 5.77-5.77 5.77zm0-9.468a3.698 3.698 0 100 7.396 3.698 3.698 0 000-7.396z" />
      </svg>
    );
  }
  return null;
}
