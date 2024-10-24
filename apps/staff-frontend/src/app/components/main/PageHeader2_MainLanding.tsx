import { LogoText } from '@lepark/common-ui';
import { Button } from 'antd';
import React from 'react';
import { IoArrowBack, IoReturnUpBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface BreadCrumbItem {
  title?: string | JSX.Element;
  pathKey: string;
  isMain?: boolean;
  isCurrent?: boolean;
}

interface BreadCrumbItemProps {
  item: BreadCrumbItem;
}
interface PageHeaderProps {
  breadcrumbItems?: BreadCrumbItem[];
}

// only diff is i dont put mb-4 below
const PageHeader2 = ({ breadcrumbItems }: PageHeaderProps) => {
  const navigate = useNavigate();

  const BreadCrumb = ({ item }: BreadCrumbItemProps) => {
    if (item.isMain) {
      return (
        <LogoText className={`text-lg font-semibold pb-2 pt-0 border-b-2`}>
          <div className={`-z-10 ${!item.isCurrent &&  "hover:bg-green-50 hover:text-green-700"}  px-2 rounded`} onClick={() => navigate(item.pathKey)}>
            {item.title}
          </div>
        </LogoText>
      );
    } else {
      return (
        <div className={`pb-2 flex items-center ${item.isCurrent ? 'border-b-2 border-green-400' : ''}`}>
          <div
            className={`px-2 rounded text-green-600 text-base opacity-60 ${
              !item.isCurrent ? 'cursor-pointer hover:opacity-100 hover:bg-green-50' : ''
            }`}
            onClick={() => navigate(item.pathKey)}
          >
            {item.title}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="flex">
        {breadcrumbItems && breadcrumbItems.length > 1 && (
          <div className="text-xl text-green-600 w-6 flex items-center pb-2 cursor-pointer hover:text-green-400">
            <IoArrowBack onClick={() => navigate(breadcrumbItems[breadcrumbItems.length - 2].pathKey)}/>
          </div>
        )}
        {breadcrumbItems &&
          breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.pathKey || index}>
              <BreadCrumb item={item} />
              {index < breadcrumbItems.length - 1 && <div className="px-3 text-green-600 opacity-60">/</div>}
            </React.Fragment>
          ))}
      </div>
      <div className="w-full h-[1px] bg-gray-400" />
    </>
  );
};

export default PageHeader2;
