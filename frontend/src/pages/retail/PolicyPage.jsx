import React from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, FileText } from 'lucide-react';

export const PolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3 border-b border-gold-500/20 pb-8">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 text-gold-600 border border-gold-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4" />
          <span>Official Legal Compliance Document</span>
        </div>
        <h1 className="text-4xl font-serif font-bold text-onyx-900">No Return and No Refund Policy</h1>
        <p className="text-xs text-gray-500 font-mono">Version 1.0 • Effective Date: August 2026</p>
      </div>

      {/* Main Notice Banner */}
      <div className="bg-onyx-900 text-beige-50 p-6 rounded-lg border-2 border-gold-500/50 shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-6 h-6 text-gold-500 shrink-0" />
          <h3 className="font-serif font-bold text-gold-500 text-base uppercase tracking-wider">
            STRICT ALL SALES ARE FINAL POLICY
          </h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed pl-9">
          All purchases on both our Retail website (<code className="text-gold-400">www.brandname.com</code>) and B2B Wholesale Portal (<code className="text-gold-400">b2b.brandname.com</code>) are final. Products cannot be returned, exchanged, or refunded after order placement, except where required by applicable law or where the admin approves an exceptional case.
        </p>
      </div>

      <div className="bg-white border border-beige-200 p-8 rounded-lg shadow-sm space-y-6 text-xs text-onyx-900 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            1. Hygiene and Safety Considerations
          </h2>
          <p>
            Due to strict medical, sanitary, and body piercing hygiene regulations, piercing jewelry (including nose rings, labrets, barbells, clickers, and ear studs) and piercing tools (including needles and forceps) interact directly with body tissue and mucous membranes. Consequently, all items are non-returnable once dispatched.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            2. Customer Verification Responsibilities
          </h2>
          <p>Customers must carefully review all product specifications prior to completing payment, including:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Jewelry gauge size (e.g., 16G, 18G, 20G) and diameter/length (e.g., 6mm, 8mm, 10mm)</li>
            <li>Biocompatible material type (e.g., 14K Solid Gold, ASTM F136 Implant Grade Titanium)</li>
            <li>Color preference, gemstone type, and unit quantity</li>
            <li>Shipping address details</li>
          </ul>
          <p className="pt-1 text-gray-600">
            Change-of-mind, preference changes, incorrect size selection, or failure to review product care information do not qualify for any return, exchange, or refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            3. Order Cancellation Eligibility
          </h2>
          <p>
            Order cancellation requests may only be accepted <strong>before</strong> the order enters processing, packing, or shipment. Once an order status advances to Confirmed, Processing, or Shipped, cancellation is not guaranteed and does not create an automatic refund entitlement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            4. Exceptional Case Review Process
          </h2>
          <p>An authorized administrator may review an exceptional support request exclusively for:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Product received is materially damaged prior to delivery</li>
            <li>Product is defective upon arrival</li>
            <li>Incorrect item shipped due to an internal fulfillment error</li>
            <li>Package confirmed lost in transit by the logistics provider</li>
          </ul>
          <p className="pt-2 font-medium">
            To report an exceptional issue, log into your customer account, navigate to <strong>My Orders</strong>, and click <strong>"Contact Support for Exceptional Issue"</strong> within 48 hours of delivery, attaching clear photograph or unboxing video proof.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            5. Approved Remedies
          </h2>
          <p>If an exceptional case is approved by the admin, one of the following remedies will be recorded:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-beige-50 p-3 rounded border border-beige-200">
              <strong className="text-onyx-900 block mb-1">Replacement</strong>
              <span>Shipment of identical replacement item</span>
            </div>
            <div className="bg-beige-50 p-3 rounded border border-beige-200">
              <strong className="text-onyx-900 block mb-1">Store Credit</strong>
              <span>Issued to customer account for future order</span>
            </div>
            <div className="bg-beige-50 p-3 rounded border border-beige-200">
              <strong className="text-onyx-900 block mb-1">Refund Exception</strong>
              <span>Manual refund processed via payment gateway</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-onyx-900 uppercase tracking-wider border-b border-gray-100 pb-2">
            6. Mandatory Audit Logging
          </h2>
          <p>
            During checkout, every customer actively acknowledges this policy by checking a compulsory agreement box. The system records the policy version, exact timestamp, IP address, and browser session ID alongside the order record for legal compliance and auditing.
          </p>
        </section>
      </div>
    </div>
  );
};
