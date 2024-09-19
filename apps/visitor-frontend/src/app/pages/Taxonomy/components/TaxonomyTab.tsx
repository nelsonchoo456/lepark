import { LogoText } from '@lepark/common-ui';
import { Button, Card, Descriptions, Divider, Tree, Typography } from 'antd';
import React from 'react';
import { OccurrenceResponse, SpeciesResponse } from '@lepark/data-access';
import { MdArrowDownward, MdArrowOutward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface TaxonomyTabProps {
  species?: SpeciesResponse;
}
const TaxonomyTab = ({ species }: TaxonomyTabProps) => {
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
                            <div className="py-2 px-4 rounded bg-green-50">
                              <LogoText className="font-bold" onClick={() => navigate(`/species/${species?.id}`)}>{species?.speciesName}</LogoText>
                              <div className="text-xs italic opacity-50">Species</div>
                            </div>
                          ),
                          key: '0-0-0-0-0-0',
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
    <div className='flex justify-center mb-2'>
      <Tree treeData={treeData} defaultExpandAll showLine/>
    </div>
  );
};

export default TaxonomyTab;
