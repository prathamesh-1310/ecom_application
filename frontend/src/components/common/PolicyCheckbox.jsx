import React from 'react';

export const PolicyCheckbox = ({ checked, onChange, required = true }) => {
  return (
    <div className="bg-white border-2 border-gold-500/40 p-4 rounded-lg shadow-sm space-y-2">
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="mt-1 w-4 h-4 text-gold-500 rounded border-gray-300 focus:ring-gold-500 cursor-pointer"
        />
        <span className="text-xs text-onyx-900 leading-relaxed">
          <strong>Mandatory Acknowledgement:</strong> I have reviewed and accept the{' '}
          <a href="/policy" target="_blank" className="text-gold-600 underline font-semibold">
            No Return and No Refund Policy (v1.0)
          </a>
          . I understand that all purchases are final and that products cannot be returned, exchanged, or refunded after order placement, except where required by applicable law or approved by admin under exceptional circumstances.
        </span>
      </label>

      {!checked && required && (
        <p className="text-[11px] text-red-600 font-medium pl-7">
          * You must check this box to proceed with checkout.
        </p>
      )}
    </div>
  );
};
