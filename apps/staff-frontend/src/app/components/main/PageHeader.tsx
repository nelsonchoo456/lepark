import { LogoText } from "@lepark/common-ui";
import { Divider } from "antd";

interface PageHeaderProps {
  children?: string | JSX.Element | JSX.Element[];
}

const PageHeader = ({ children }: PageHeaderProps) => {
  return <>
    <LogoText className="text-xl font-semibold pt-1 pb-2 border-b-2 pt-0">{children}</LogoText>
    <div className="w-full h-[1px] bg-gray-400 mb-4"/>
  </>
}

export default PageHeader;