import { twMerge } from 'tailwind-merge';

const CheckBox = ({ className, ...props }) => {
  return <input type="checkbox" className={twMerge(className)} {...props} />;
};
export default CheckBox;
