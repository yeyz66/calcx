import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">This Privacy Policy describes how calcx.org (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects your information when you use our website. This policy applies to users in the United States.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
        <p className="mb-4">We do not require you to create an account or provide personal information to use our calculator tools. We may collect non-personal information such as browser type, device information, and usage data to improve our services.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">2. Use of Information</h2>
        <p className="mb-4">We use collected information to operate, maintain, and improve our website and services. We do not sell or share your personal information with third parties for marketing purposes.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">3. Cookies</h2>
        <p className="mb-4">We may use cookies or similar technologies to enhance your experience and analyze website usage. You can control cookies through your browser settings.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">4. Third-Party Services</h2>
        <p className="mb-4">Our website may contain links to third-party sites or use third-party analytics services. We are not responsible for the privacy practices of these third parties.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Security</h2>
        <p className="mb-4">We take reasonable measures to protect your information from unauthorized access or disclosure. However, no method of transmission over the Internet is 100% secure.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">6. Children&apos;s Privacy</h2>
        <p className="mb-4">Our website is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">7. Changes to This Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@calcx.org" className="text-blue-600 underline">support@calcx.org</a>.</p>
        <p className="mt-8 text-gray-500 text-sm">Effective Date: {new Date().toLocaleDateString('en-US')}</p>
      </main>
      <Footer />
    </div>
  );
} 