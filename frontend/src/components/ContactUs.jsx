import { useState, useEffect } from 'react';
import { products as productsApi, grades as gradesApi, colors as colorsApi } from '../api/client';
import radiantBg from '../assets/radiant-gradient.svg';

export default function ContactUs() {
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    product: '',
    grade: '',
    color: '',
    message: '',
  });

  const [productList, setProductList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Fetch products on mount
  useEffect(() => {
    productsApi
      .list()
      .then((res) => {
        const data = res.data;
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        setProductList(all);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch grades and colors when product changes
  useEffect(() => {
    if (!form.product) {
      setGradeList([]);
      setColorList([]);
      return;
    }

    const selected = productList.find((p) => p._id === form.product);
    if (!selected) return;

    gradesApi
      .list()
      .then((res) => {
        const data = res.data;
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        const filtered = all.filter(
          (g) => (g.product?._id ?? g.product) === form.product
        );
        setGradeList(filtered);
      })
      .catch(() => setGradeList([]));

    colorsApi
      .list()
      .then((res) => {
        const data = res.data;
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        const filtered = all.filter(
          (c) => (c.product?._id ?? c.product) === form.product
        );
        setColorList(filtered);
      })
      .catch(() => setColorList([]));
  }, [form.product, productList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'product') {
        return { ...prev, product: value, grade: '', color: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const selectedProduct = productList.find((p) => p._id === form.product);
      const selectedGrade = gradeList.find((g) => g._id === form.grade);
      const selectedColor = colorList.find((c) => c._id === form.color);
      const key = import.meta.env.VITE_WEB3FORMS_KEY;
      const formData = new FormData();
      formData.append('access_key', key);
      formData.append('subject', `B2B Inquiry from ${form.companyName}`);
      formData.append('Company Name', form.companyName);
      formData.append('Email', form.email);
      formData.append('Phone', form.phone);
      if (selectedProduct) formData.append('Product', selectedProduct.name);
      if (selectedGrade) formData.append('Grade', selectedGrade.name);
      if (selectedColor) formData.append('Color', selectedColor.name);
      formData.append('Message', form.message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to send inquiry. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="relative mt-16 overflow-hidden rounded-3xl mx-auto max-w-7xl">
        <img src={radiantBg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative z-10 max-w-2xl mx-auto text-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5 border border-emerald-200">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Thank you for reaching out!</h2>
          <p className="text-black/60 mb-6">
            Your inquiry has been submitted successfully. Our team will get back to you within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setForm({ companyName: '', email: '', phone: '', product: '', grade: '', color: '', message: '' });
            }}
            className="text-sm font-medium text-[#F57799] hover:text-[#FB9B8F] transition-colors"
          >
            Send another inquiry
          </button>
        </div>
      </section>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#F57799]/40 focus:border-[#F57799]/50 transition-colors placeholder:text-black/40';
  const labelClass = 'block text-sm font-medium text-black/70 mb-1.5';

  return (
    <section
      id="contact"
      className="overflow-hidden scroll-mt-20 bg-white"
      style={{
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
    >
    

      <div className="px-4 py-10 lg:py-16 lg:px-0 scroll-mt-20 bg-gradient-to-b from-[#F57799]/10 to-[#F57799]/0">
      <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left — info */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F57799] mb-2">Get in touch</h2>
            <p className="text-black/60 mb-8 leading-relaxed">
              Interested in our products or need a custom formulation? Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7CD]/50 border border-[#FDC3A1]/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#F57799]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Email</p>
                  <a href="mailto:contact@colorsmith.com" className="text-sm text-black/50 hover:text-[#F57799] transition-colors">
                    contact@colorsmith.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7CD]/50 border border-[#FDC3A1]/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#F57799]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Phone</p>
                  <a href="tel:+919311029421" className="text-sm text-black/50 hover:text-[#F57799] transition-colors">
                    +91 93110 29421
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF7CD]/50 border border-[#FDC3A1]/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#F57799]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-black">Response time</p>
                  <p className="text-sm text-black/50">Within 24 hours on business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
            >
              {/* Row: Company + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="companyName" className={labelClass}>Company name *</label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Your company"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={labelClass}>Phone number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9311029421"
                  className={inputClass}
                />
              </div>

              {/* Product */}
              <div>
                <label htmlFor="product" className={labelClass}>Product of interest</label>
                <select
                  id="product"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loadingProducts}
                >
                  <option value="" className="bg-white text-black">
                    {loadingProducts ? 'Loading products...' : 'Select a product'}
                  </option>
                  {productList.map((p) => (
                    <option key={p._id} value={p._id} className="bg-white text-black">{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Row: Grade + Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="grade" className={labelClass}>Grade</label>
                  <select
                    id="grade"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={!form.product}
                  >
                    <option value="" className="bg-white text-black">
                      {!form.product ? 'Select product first' : gradeList.length === 0 ? 'No grades available' : 'Select a grade'}
                    </option>
                    {gradeList.map((g) => (
                      <option key={g._id} value={g._id} className="bg-white text-black">{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="color" className={labelClass}>Color</label>
                  <select
                    id="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className={inputClass}
                    disabled={!form.product}
                  >
                    <option value="" className="bg-white text-black">
                      {!form.product ? 'Select product first' : colorList.length === 0 ? 'No colors available' : 'Select a color'}
                    </option>
                    {colorList.map((c) => (
                      <option key={c._id} value={c._id} className="bg-white text-black">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className={labelClass}>Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements — quantities, custom formulations, timeline, etc."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 rounded-xl bg-[#F57799] text-white font-semibold hover:bg-[#FB9B8F] transition-all shadow-lg shadow-[#F57799]/20 hover:shadow-[#F57799]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send inquiry'}
              </button>

              <p className="text-xs text-black/40 text-center">
                By submitting, you agree to our{' '}
                <a href="/policies/privacy" className="underline hover:text-[#F57799]">privacy policy</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
      
      </div>
    </section>
  );
}
