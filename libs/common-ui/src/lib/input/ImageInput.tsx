import { FiUpload } from "react-icons/fi";

interface ImageInputProps {
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
  [key: string]: any;
}

export const ImageInput = ({ children, ...restFields }: ImageInputProps) => {
  return (
    <div className={`flex flex-col items-center justify-center border-[1px] border-dashed border-green-200 p-4 relative cursor-pointer rounded-lg hover:bg-green-50`}>
      <input {...restFields} className="absolute inset-0 opacity-0 cursor-pointer"></input>
      <FiUpload className="text-3xl opacity-25 mb-2"/>
      <p className="opacity-25">{children ? children : "Upload Here"}</p>
    </div>
  );
};
