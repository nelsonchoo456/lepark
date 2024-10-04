import { Tag } from 'antd';

interface PromotionValueTag {
  children: number | string | JSX.Element | JSX.Element[];
  isPercentage: boolean;
}

const PromotionValueTag = ({ children, isPercentage }: PromotionValueTag) => {
  return isPercentage ? (
    <Tag bordered={false}>
      <strong>{children}</strong> %
    </Tag>
  ) : (
    <Tag bordered={false}>
      $ <strong>{children}</strong>
    </Tag>
  );
};

export default PromotionValueTag;
