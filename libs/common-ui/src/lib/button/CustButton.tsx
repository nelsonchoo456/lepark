import { Button } from "antd";

interface CustButtonProps {
  [key: string]: any;
}

export const CustButton = ({ ...fields }: CustButtonProps) => {
  return <Button {...fields}/>
}
