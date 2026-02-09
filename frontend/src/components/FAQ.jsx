import { useState } from 'react';

const faqs = [
  {
    question: 'What types of cosmetic products do you supply?',
    answer:
      'We supply a comprehensive range of cosmetic raw materials and finished products including nail lacquers, lipsticks, lip gloss, primers, eyeliners, mascara, and more. Each product is available in multiple grades to match your formulation needs and budget.',
  },
  {
    question: 'What is the minimum order quantity (MOQ)?',
    answer:
      'Our MOQs vary by product type and grade. We offer flexible quantities for sampling and scale-friendly pricing for bulk orders. Contact our sales team for specific MOQ details for the products you are interested in.',
  },
  {
    question: 'How do custom color sets work?',
    answer:
      'You can browse our curated color sets or build your own from our extensive color library. Simply select the shades you need, choose your preferred grade, and add the set to your cart. Custom sets are ideal for brands launching new collections.',
  },
  {
    question: 'Do you provide regulatory and compliance documents?',
    answer:
      'Yes. We provide Certificates of Analysis (COA), Technical Data Sheets (TDS), and other compliance documentation for all our products. These documents are accessible directly through your account dashboard.',
  },
  {
    question: 'What grades are available and how do they differ?',
    answer:
      'We offer multiple grades per product — from economy to premium — so you can match quality to each SKU in your line. Higher grades offer enhanced pigmentation, longer wear, and smoother textures. Our team can help you choose the right grade for your application.',
  },
  {
    question: 'How do I place a bulk order?',
    answer:
      'You can place bulk orders directly through the platform by adding items to your cart and proceeding to checkout. For very large orders or custom requirements, reach out to our dedicated bulk-order support team for volume pricing and lead-time estimates.',
  },
  {
    question: 'What is your quality assurance process?',
    answer:
      'Every batch undergoes strict quality control testing including color consistency checks, viscosity measurements, and stability testing. We maintain full batch traceability so you get repeatable results with every order.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Standard orders ship within 3–5 business days. Bulk and custom orders may require 7–14 business days depending on volume and specifications. We will provide tracking information once your order is dispatched.',
  },
];

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''
        }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-shadow hover:shadow">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
      >
        <span className="text-base font-semibold text-slate-900">{faq.question}</span>
        <ChevronIcon open={isOpen} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="mt-16 pt-16 border-t border-slate-200">
      <div className='text-center'>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
        <p className="text-slate-600 mb-10 w-full max-w-2xl mx-auto">
        Everything you need to know about our products, ordering, and services.
      </p>
      </div>
     
      <div className="grid grid-cols-1  gap-4 max-w-5xl mx-auto">
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            faq={faq}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </section>
  );
}
