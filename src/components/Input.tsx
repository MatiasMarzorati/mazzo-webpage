import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isTextArea?: boolean;
  error?: string;
}

export default function Input({
  isTextArea = false,
  error,
  ...props
}: InputProps) {
  const baseStyle = `
    text-gray-100 bg-slate-900/50 backdrop-blur-xl backdrop-saturate-200 
    border-2 px-3 py-4 text-sm rounded-xl 
    hover:bg-slate-900/70 
    focus:bg-slate-900/80 focus:outline-none focus:bg-slate-900/50
    transition-colors duration-200 ease-in-out
  `;

  const errorStyle = error
    ? 'border-red-500'
    : 'border-gray-800 hover:border-gray-700 focus:border-gray-500';
  const combinedStyle = `${baseStyle} ${errorStyle}`;

  return (
    <div className="flex flex-col gap-1 w-full">
      {isTextArea ? (
        <textarea
          className={`${combinedStyle} resize-none w-full h-24`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={combinedStyle} {...props} />
      )}
      {error && (
        <span className="mt-1 text-red-500 text-xs">{`${error}*`}</span>
      )}
      <style jsx>{`
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.5) inset;
          box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.5) inset;
          -webkit-text-fill-color: #e2e8f0 !important;
          backdrop-filter: blur(10px) saturate(200%);
          background-color: rgba(15, 23, 42, 0.5) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
