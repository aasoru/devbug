import { twMerge } from 'tailwind-merge';

const Card = ({ children, className }) => {
  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
        <div
          className={twMerge(
            'bg-neutral-700 p-12 rounded text-white',
            'dark:text-neutral-700 dark:bg-white',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const Title = ({ children, className, ...props }) => {
  return (
    <h2
      className={twMerge(
        'text-5xl border-b-2 pb-4',
        'dark:border-neutral-700',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

const Description = ({ children, className }) => {
  return <div className={twMerge('', className)}>{children}</div>;
};

const Content = ({ children, className }) => {
  return <main className={twMerge('', className)}>{children}</main>;
};

Card.Title = Title;
Card.Description = Description;
Card.Content = Content;

export default Card;
