import { LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Tree, Typography } from 'antd';
import React from 'react';
import { OccurrenceResponse, SpeciesResponse } from '@lepark/data-access';
import { MdArrowDownward, MdArrowOutward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface AboutTabProps {
  species?: SpeciesResponse;
  occurrence?: OccurrenceResponse;
}
const AboutTab = ({ species, occurrence }: AboutTabProps) => {
  const navigate = useNavigate();

  // Tree data
  const treeData = [
    {
      title: (
        <>
          <div className="font-bold">{species?.phylum}</div>
          <div className="text-xs italic opacity-50">Phylum</div>
        </>
      ),
      key: '0',
      children: [
        {
          title: (
            <>
              <div className="font-bold">{species?.class}</div>
              <div className="text-xs italic opacity-50">Class</div>
            </>
          ),
          key: '0-0',
          children: [
            {
              title: (
                <>
                  <div className="font-bold">{species?.order}</div>
                  <div className="text-xs italic opacity-50">Order</div>
                </>
              ),
              key: '0-0-0',
              children: [
                {
                  title: (
                    <>
                      <div className="font-bold">{species?.family}</div>
                      <div className="text-xs italic opacity-50">Family</div>
                    </>
                  ),
                  key: '0-0-0-0',
                  children: [
                    {
                      title: (
                        <>
                          <div className="font-bold">{species?.genus}</div>
                          <div className="text-xs italic opacity-50">Genus</div>
                        </>
                      ),
                      key: '0-0-0-0-0',
                      children: [
                        {
                          title: (
                            <>
                              <LogoText className="font-bold" onClick={() => navigate(`/species/${species?.id}`)}>{species?.speciesName}</LogoText>
                              <div className="text-xs italic opacity-50">Species</div>
                            </>
                          ),
                          key: '0-0-0-0-0-0',
                          children: [
                            {
                              title: (
                                <div className="py-2 px-4 rounded bg-green-50">
                                  <LogoText className="font-bold">{occurrence?.title}</LogoText>
                                  <div className="text-xs opacity-50">This Occurrence</div>
                                </div>
                              ),
                              key: '0-0-0-0-0-0-0',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div>
      {/* cursor-pointer hover:bg-green-50 transition-3s */}
      <Card className="flex-1 p-4 mb-4" styles={{ body: { padding: 0 } }}>
        <div className="flex gap-2">
          {species?.images && species.images.length > 0 ? (
            <div
              style={{
                backgroundImage: `url('${species.images[0]}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
              }}
              className="h-20 w-20 rounded-full bg-gray-200 shadow-lg p-4 grow-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 shadow-lg p-4" />
          )}
          <div className="w-full">
            {/* <div className='text-lg font-bold'>Species</div> */}
            <div
              className="cursor-pointer hover:bg-green-50/40 transition-3s p-2 px-4 rounded-full flex items-center justify-between"
              onClick={() => navigate(`/species/${species?.id}`)}
            >
              <div>
                <LogoText className="text-lg">{species?.commonName}</LogoText>
                <LogoText className="text-base italic opacity-50 ml-4">{species?.speciesName}</LogoText>
              </div>
              <Button shape="circle" icon={<MdArrowOutward />}></Button>
            </div>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
                expandable: true,
                symbol: 'more',
              }}
              className='pl-4'
            >
              {species?.speciesDescription}
            </Typography.Paragraph>
          </div>
        </div>
      </Card>
      <Card className='w-full' styles={{ body: {padding: 0} }}>
        <Divider className='w-full' orientation="left"><LogoText className="text-base italic">Taxonomy Tree</LogoText></Divider>
        <div className='flex justify-center mb-2'>
          <Tree treeData={treeData} defaultExpandAll showLine/>
        </div>
      </Card>
    </div>
  );
};

export default AboutTab;
