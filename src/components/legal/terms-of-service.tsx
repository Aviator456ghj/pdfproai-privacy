'use client';

import React from 'react';
import { LegalModal } from './legal-modal';

interface TermsOfServiceProps {
  open: boolean;
  onClose: () => void;
}

export function TermsOfService({ open, onClose }: TermsOfServiceProps) {
  return (
    <LegalModal open={open} onClose={onClose} title="Terms of Service">
      <p className="text-xs text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing and using PDFPro AI (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree, please do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
      </p>

      <h3>2. Description of Service</h3>
      <p>
        PDFPro AI provides online PDF processing tools including but not limited to: merging, splitting, compressing, converting, editing, and AI-powered analysis of PDF documents. The Service is available in free and paid tiers with varying features and limitations.
      </p>

      <h3>3. User Accounts</h3>
      <p>Some features may require account registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

      <h3>4. Free Tier Usage</h3>
      <p>The free tier allows up to <strong>5 tasks per day</strong> with a file size limit of 10 MB. Free-tier outputs may include a watermark and may require viewing advertisements. We reserve the right to modify free-tier limits at any time.</p>

      <h3>5. Paid Subscriptions</h3>
      <p>Paid plans (Premium and Business) are billed on a recurring basis. By subscribing, you authorize us to charge the applicable fees to your payment method. You may cancel your subscription at any time; your access continues until the end of the current billing period. We offer a <strong>30-day money-back guarantee</strong> on all paid plans.</p>

      <h3>6. File Processing and Data</h3>
      <p>
        <strong>Automatic Deletion:</strong> All files uploaded to PDFPro AI are <strong>automatically and permanently deleted from our servers within 2 hours</strong> of upload. We do not retain, store, or archive your uploaded documents.
      </p>
      <p>
        <strong>Processing:</strong> Files are processed solely for the purpose of completing your requested task. We do not read, analyze for training purposes, or share your file contents with any third party.
      </p>
      <p>
        <strong>Your Responsibility:</strong> You are solely responsible for the content of files you upload. You must have the right to process the files you submit and must not use the Service for any illegal purpose.
      </p>

      <h3>7. Acceptable Use</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose</li>
        <li>Upload files containing malware, viruses, or harmful code</li>
        <li>Attempt to bypass usage limits, security measures, or payment requirements</li>
        <li>Resell, redistribute, or exploit the Service without authorization</li>
        <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
        <li>Use automated tools (bots, scrapers) to access the Service at scale</li>
      </ul>

      <h3>8. Intellectual Property</h3>
      <p>The PDFPro AI website, design, and technology are our intellectual property. You retain all rights to your uploaded files and the processed outputs. The Business plan includes white-label rights to remove PDFPro branding from processed outputs.</p>

      <h3>9. Advertisements</h3>
      <p>Free-tier users may see advertisements during their use of the Service. These advertisements are served by third-party ad networks and are subject to their own terms and privacy policies. We are not responsible for the content of third-party advertisements.</p>

      <h3>10. Disclaimer of Warranties</h3>
      <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

      <h3>11. Limitation of Liability</h3>
      <p>TO THE FULLEST EXTENT PERMITTED BY LAW, PDFPRO AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.</p>

      <h3>12. Changes to Terms</h3>
      <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email notification or a prominent notice on our website. Your continued use of the Service after changes are posted constitutes acceptance of the updated Terms.</p>

      <h3>13. Governing Law</h3>
      <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.</p>

      <h3>14. Contact</h3>
      <p>
        For questions about these Terms, please contact us at{' '}
        <a href="mailto:legal@pdfpro.ai">legal@pdfpro.ai</a>.
      </p>
    </LegalModal>
  );
}