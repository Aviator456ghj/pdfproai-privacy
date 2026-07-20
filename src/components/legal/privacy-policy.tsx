'use client';

import React from 'react';
import { LegalModal } from './legal-modal';

interface PrivacyPolicyProps {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ open, onClose }: PrivacyPolicyProps) {
  return (
    <LegalModal open={open} onClose={onClose} title="Privacy Policy">
      <p className="text-xs text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h3>1. Introduction</h3>
      <p>
        PDFPro AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our PDF processing services. By using PDFPro AI, you agree to the practices described in this policy.
      </p>

      <h3>2. Information We Collect</h3>
      <p><strong>Files You Upload:</strong> When you use our tools, you upload PDF and other document files for processing. We do not use your uploaded files for any purpose other than processing the specific task you requested.</p>
      <p><strong>Usage Data:</strong> We collect anonymous usage analytics including pages visited, tools used, processing times, and device/browser information to improve our services.</p>
      <p><strong>Local Storage:</strong> We use your browser&apos;s local storage to track your daily usage count (for free-tier limits) and to remember your preferences. This data never leaves your device.</p>

      <h3>3. How We Handle Your Files</h3>
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 my-4">
        <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-sm mb-1">🔒 Your files are automatically deleted within 2 hours.</p>
        <p className="text-emerald-700 dark:text-emerald-400 text-sm">
          All uploaded files are processed in real-time and are <strong>automatically and permanently deleted from our servers within 2 hours</strong> of upload. We do not store, archive, or retain your documents. No human ever accesses your files.
        </p>
      </div>
      <p>Files are encrypted with AES-256 during transmission (TLS 1.3) and during processing. After the 2-hour deletion window, no copy of your file exists on any of our systems.</p>

      <h3>4. How We Use Your Information</h3>
      <ul>
        <li>Processing your uploaded files and delivering results</li>
        <li>Providing and maintaining our services</li>
        <li>Improving our tools, performance, and user experience</li>
        <li>Enforcing our usage limits and terms of service</li>
        <li>Responding to your support requests</li>
      </ul>

      <h3>5. Third-Party Services</h3>
      <p>We may use third-party analytics services (e.g., Google Analytics) to collect anonymous usage data. These services do not have access to your uploaded files. We may display third-party advertisements to free-tier users; ad networks may use cookies to serve relevant ads, which is governed by their own privacy policies.</p>

      <h3>6. Data Security</h3>
      <p>We implement industry-standard security measures including:</p>
      <ul>
        <li><strong>AES-256 encryption</strong> for files at rest during processing</li>
        <li><strong>TLS 1.3</strong> encryption for all data in transit</li>
        <li>Automatic file deletion within 2 hours</li>
        <li>Regular security audits and penetration testing</li>
        <li>Access controls and audit logging</li>
      </ul>

      <h3>7. Cookies</h3>
      <p>PDFPro AI uses minimal, essential cookies for session management. Our advertising partners may set their own cookies to serve personalized ads. You can manage cookie preferences through your browser settings.</p>

      <h3>8. Children&apos;s Privacy</h3>
      <p>PDFPro AI is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

      <h3>9. Your Rights</h3>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction or deletion of your data</li>
        <li>Object to or restrict processing of your data</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h3>10. Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date.</p>

      <h3>11. Contact Us</h3>
      <p>
        If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
        <a href="mailto:privacy@pdfpro.ai">privacy@pdfpro.ai</a>.
      </p>
    </LegalModal>
  );
}