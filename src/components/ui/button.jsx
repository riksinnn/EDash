export const Button = ({ children, variant = "primary", ...props }) => {
  const baseStyles = "px-6 py-2 rounded-lg font-medium transition-all active:scale-95";
  
  const variants = {
    primary: "bg-planner-olive text-white hover:bg-opacity-90 shadow-md",
    outline: "border-2 border-planner-olive text-planner-olive hover:bg-planner-cream",
    ghost: "text-stone-500 hover:text-planner-olive"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};