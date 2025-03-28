// src/components/common/Button.jsx
const Button = ({ children, onClick, type = "primary", disabled = false, className = "" }) => {
    const baseClasses = "px-4 py-2 rounded-md font-medium focus:outline-none";
    
    const styles = {
      primary: "bg-primary-600 text-white hover:bg-primary-700",
      secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
      danger: "bg-red-600 text-white hover:bg-red-700"
    };
    
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseClasses} ${styles[type]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default Button;