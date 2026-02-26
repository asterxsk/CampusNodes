import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  type = 'button', 
  fullWidth = false, 
  to, 
  href, 
  disabled 
}) => {
  const baseStyles = "relative font-display font-bold uppercase tracking-widest text-xs px-8 py-4 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-full cursor-pointer";

  const variants = {
    primary: "bg-white text-black border-2 border-transparent hover:scale-105",
    outline: "border-2 border-white text-white bg-transparent hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    ghost: "text-gray-400 bg-transparent hover:text-white",
    accent: "bg-accent text-white border-2 border-transparent hover:scale-105"
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const buttonElement = (
    <button type={type} className={combinedClassName} onClick={onClick} disabled={disabled}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );

  if (to) {
    return <Link to={to} className="inline-block">{buttonElement}</Link>;
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
        {buttonElement}
      </a>
    );
  }

  return buttonElement;
};

export default Button;
