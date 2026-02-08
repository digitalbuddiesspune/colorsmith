import { useParams, Link } from 'react-router-dom';

const policies = {
  privacy: { title: 'Privacy Policy', content: 'Your privacy matters. We collect only what is necessary to serve your B2B orders and account. Contact us for full policy details.' },
  terms: { title: 'Terms of Use', content: 'By using Color Smith you agree to our terms of service. Contact legal@colorsmith.com for a copy.' },
  shipping: { title: 'Shipping & Returns', content: 'We ship globally. Returns and claims are handled per order. Contact support for shipping and return policy details.' },
};

export default function Policies() {
  const { slug } = useParams();
  const policy = policies[slug];

  if (!policy) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">Policy not found.</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">← Home</Link>
      <h1 className="text-2xl font-semibold text-slate-900 mb-4">{policy.title}</h1>
      <p className="text-slate-600">{policy.content}</p>
    </div>
  );
}
