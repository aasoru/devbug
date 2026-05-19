import { twMerge } from 'tailwind-merge';

const TextArea = ({
  className,
  classNameInput,
  type = 'text',
  icon: Icon = null,
  ...props
}) => {
  return (
    <div className={twMerge(className, 'relative')}>
      {Icon && (
        <Icon className="pointer-events-none text-neutral-300 w-6 h-6 absolute top-1/2 transform -translate-y-1/2 left-2" />
      )}
      <textarea
        className={twMerge(
          'block w-full px-4 py-2 mb-4 text-neutral-800 placeholder:text-neutral-500 text-sm rounded-md',
          'border border-neutral-300',
          'focus:outline focus:outline-1 focus:outline-neutral-400 focus:border-neutral-400',
          'disabled:bg-neutral-300',
          Icon && 'pl-9',
          classNameInput
        )}
        {...props}
      />
    </div>
  );
};
export default TextArea;
