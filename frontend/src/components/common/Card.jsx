// src/components/common/Card.jsx
const Card = ({ title, subtitle, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );