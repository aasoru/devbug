const Label = ({ children, ...props }) => {
  return (
    <label className="block mb-1 text-neutral-600 font-bold" {...props}>
      {children}
    </label>
  );
};

export default Label;
