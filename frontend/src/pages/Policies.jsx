import { useParams, Link } from 'react-router-dom';
import { scrollToTop } from '../utility/scrollToTop';

const policies = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'February 2026',
    sections: [
      {
        heading: 'Introduction',
        paragraphs: [
          'Color Smith ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, place orders for cosmetics raw materials and finished products, or interact with our B2B services. Please read this policy carefully.',
        ],
      },
      {
        heading: 'Information We Collect',
        paragraphs: [
          'We collect information that you provide directly to us, including: name, email address, phone number, company/business name, billing and shipping addresses, and payment-related information when you create an account, place orders, or contact us.',
          'We automatically collect certain technical data when you visit our site, such as IP address, browser type, device information, and pages visited. We may use cookies and similar technologies to improve your experience and analyse site usage.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        paragraphs: [
          'We use your information to process and fulfil orders, manage your account, communicate with you about orders and support, improve our website and services, comply with legal obligations, and send you relevant updates or marketing (where you have consented). We do not sell your personal information to third parties.',
        ],
      },
      {
        heading: 'Sharing of Information',
        paragraphs: [
          'We may share your information with service providers who assist us in operations (e.g. payment processing, shipping, hosting). These parties are contractually bound to protect your data. We may also disclose information where required by law or to protect our rights and safety.',
        ],
      },
      {
        heading: 'Data Security',
        paragraphs: [
          'We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Payment data is processed by secure, PCI-compliant providers.',
        ],
      },
      {
        heading: 'Your Rights',
        paragraphs: [
          'Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, or to object to certain processing. To exercise these rights or ask questions about our practices, please contact us using the details below.',
        ],
      },
      {
        heading: 'Contact Us',
        paragraphs: [
          'For privacy-related questions or requests, contact us at contact@colorsmith.com or +91 93110 29421. We will respond within a reasonable time.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    lastUpdated: 'February 2026',
    sections: [
      {
        heading: 'Acceptance of Terms',
        paragraphs: [
          'By accessing or using the Color Smith website and services, you agree to be bound by these Terms of Use. If you do not agree, please do not use our site or services. We reserve the right to update these terms; continued use after changes constitutes acceptance.',
        ],
      },
      {
        heading: 'Eligibility',
        paragraphs: [
          'Our services are intended for business-to-business (B2B) customers. You represent that you have the authority to bind your organisation and that you will use the site and our products in compliance with all applicable laws.',
        ],
      },
      {
        heading: 'Account and Registration',
        paragraphs: [
          'You may need to register an account to place orders. You are responsible for maintaining the confidentiality of your login details and for all activity under your account. You must notify us promptly of any unauthorised use.',
        ],
      },
      {
        heading: 'Orders and Payment',
        paragraphs: [
          'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel orders. Prices are as displayed at the time of order, subject to applicable taxes. Payment terms are as agreed or as displayed at checkout. For disputes or failed payments, please contact us.',
        ],
      },
      {
        heading: 'Products and Specifications',
        paragraphs: [
          'We strive to ensure product information and specifications are accurate. We do not warrant that descriptions, colours, or grades will be error-free. Minimum order quantities (MOQ) and product availability apply as stated on the site or in your order confirmation.',
        ],
      },
      {
        heading: 'Intellectual Property',
        paragraphs: [
          'All content on this site (text, logos, images, design) is owned by Color Smith or its licensors and is protected by intellectual property laws. You may not copy, modify, or use our content for commercial purposes without our prior written consent.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        paragraphs: [
          'To the fullest extent permitted by law, Color Smith shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the site or products. Our total liability for any claim shall not exceed the amount you paid for the relevant order.',
        ],
      },
      {
        heading: 'Termination',
        paragraphs: [
          'We may suspend or terminate your access to the site or your account at any time for breach of these terms or for any other reason. Upon termination, your right to use the site ceases immediately.',
        ],
      },
      {
        heading: 'Governing Law',
        paragraphs: [
          'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For questions about these Terms of Use, contact us at contact@colorsmith.com or +91 93110 29421.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping & Returns',
    lastUpdated: 'February 2026',
    sections: [
      {
        heading: 'Shipping',
        paragraphs: [
          'Color Smith ships cosmetics raw materials and finished products to business addresses. We offer domestic (India) and international shipping where applicable. Shipping methods, carriers, and delivery timeframes depend on your location and order size and will be confirmed at checkout or in your order confirmation.',
          'Delivery times are estimates and not guaranteed. Delays due to customs, weather, or carrier issues are outside our control. You are responsible for providing an accurate, accessible delivery address and for any additional customs or import charges where applicable.',
        ],
      },
      {
        heading: 'Shipping Costs',
        paragraphs: [
          'Shipping costs are calculated based on weight, destination, and selected service. They are displayed before you confirm your order. For large or bulk orders, we may contact you to arrange freight or dedicated delivery.',
        ],
      },
      {
        heading: 'Returns and Refunds',
        paragraphs: [
          'We accept returns or exchanges only for products that are defective, damaged in transit, or not as described. You must notify us within a reasonable time (typically 7–14 days of receipt) and provide evidence (e.g. photos, description). We may require the product to be returned for inspection before approving a refund or replacement.',
          'Refunds, when approved, will be processed to the original payment method within a reasonable period. Return shipping costs for non-defective items are the responsibility of the customer unless otherwise agreed.',
        ],
      },
      {
        heading: 'Non-Returnable Items',
        paragraphs: [
          'Custom or made-to-order products, mixed or opened bulk materials, and certain finished products may not be eligible for return due to hygiene or product nature. This will be indicated on the product or order where applicable.',
        ],
      },
      {
        heading: 'Claims for Damage or Shortage',
        paragraphs: [
          'Please inspect shipments upon delivery. If you notice damage or shortage, note it on the delivery receipt and contact us within 48 hours with details and, if possible, photos. We will work with the carrier and you to resolve valid claims.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'For shipping, returns, or claims, contact us at contact@colorsmith.com or +91 93110 29421. Our team will assist you with tracking, returns, and any issues with your order.',
        ],
      },
    ],
  },
};

export default function Policies() {
  const { slug } = useParams();
  const policy = policies[slug];

  if (!policy) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Policy not found.</p>
        <Link to="/" className="mt-4 inline-block text-amber-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  const hasSections = Array.isArray(policy.sections) && policy.sections.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">← Home</Link>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">{policy.title}</h1>
      {policy.lastUpdated && (
        <p className="text-slate-500 text-sm mb-8">Last updated: {policy.lastUpdated}</p>
      )}
      <div className="prose prose-slate max-w-none">
        {hasSections ? (
          policy.sections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">{section.heading}</h2>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                {section.paragraphs.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-slate-600">{policy.content}</p>
        )}
      </div>
      <div className="mt-10 pt-6 border-t border-slate-200">
        <Link to="/policies/privacy" onClick={scrollToTop} className="text-amber-600 hover:underline text-sm mr-4">Privacy Policy</Link>
        <Link to="/policies/terms" onClick={scrollToTop} className="text-amber-600 hover:underline text-sm mr-4">Terms of Use</Link>
        <Link to="/policies/shipping" onClick={scrollToTop} className="text-amber-600 hover:underline text-sm">Shipping & Returns</Link>
      </div>
    </div>
  );
}
