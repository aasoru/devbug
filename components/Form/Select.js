import { twMerge } from 'tailwind-merge';

const Select = ({ className, children, ...props }) => {
  return (
    <select
      className={twMerge(
        'block w-full px-4 py-2 mb-4 text-neutral-800 placeholder:text-neutral-400 text-sm rounded-md',
        'border border-neutral-300',
        'focus:outline focus:outline-1 focus:outline-neutral-400 focus:border-neutral-400',
        'disabled:bg-neutral-300',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};
export default Select;
