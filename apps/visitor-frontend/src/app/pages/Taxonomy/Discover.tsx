import { ContentWrapper, Divider, LogoText } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaTent } from 'react-icons/fa6';
import { Badge, Card, Space, TreeSelect, Input, Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { plantTaxonomy } from '@lepark/data-utility';
import { useState, useEffect, useMemo } from 'react';
import { getAllSpecies, SpeciesResponse } from '@lepark/data-access';
import { FiSearch } from 'react-icons/fi';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import styled from 'styled-components';
import { MdArrowDropDown } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';

// Add these type definitions at the top of your file
type OrdersType = { orders: string[] };
type PhylumDataType = {
  classes: string[];
  [className: string]: string[] | OrdersType;
};
type PlantTaxonomyType = {
  [phylum: string]: PhylumDataType;
};

const { SHOW_PARENT } = TreeSelect;

const Discover = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPark } = usePark();
  // const cardStyle = 'w-full text-left inline-flex items-center border-x-transparent py-2 px-4 cursor-pointer hover:bg-green-600/10';
  const speciesTitleStyle = 'text-lg font-medium text-green-700';
  const [loading, setLoading] = useState(false);
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      try {
        const species = await getAllSpecies();
        setFetchedSpecies(species.data);
        console.log('fetched species', species.data);
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, []);

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/discover/${speciesId}`);
  };

  const treeData = useMemo(() => {
    const data: any[] = [];
    Object.entries(plantTaxonomy as PlantTaxonomyType).forEach(([phylum, phylumData]) => {
      const phylumNode: any = {
        title: phylum,
        value: `phylum-${phylum}`,
        key: `phylum-${phylum}`,
        children: [],
      };

      phylumData.classes.forEach((className: string) => {
        const classNode: any = {
          title: className,
          value: `class-${phylum}-${className}`,
          key: `class-${phylum}-${className}`,
          children: [],
        };

        const classData = phylumData[className] as OrdersType;
        if (classData && 'orders' in classData && Array.isArray(classData.orders)) {
          classData.orders.forEach((order: string) => {
            classNode.children.push({
              title: order,
              value: `order-${phylum}-${className}-${order}`,
              key: `order-${phylum}-${className}-${order}`,
            });
          });
        }

        phylumNode.children.push(classNode);
      });

      data.push(phylumNode);
    });
    return data;
  }, []);

  const filteredSpecies = useMemo(() => {
    if (loading) return [];
    return fetchedSpecies.filter((species) => {
      const matchesSearch =
        species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        species.speciesName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTaxonomy =
        selectedTaxonomy.length === 0 ||
        selectedTaxonomy.some((tax) => {
          const [level, phylum, className, order] = tax.split('-');
          if (level === 'phylum') return species.phylum.toLowerCase() === phylum.toLowerCase();
          if (level === 'class')
            return species.phylum.toLowerCase() === phylum.toLowerCase() && species.class.toLowerCase() === className.toLowerCase();
          if (level === 'order')
            return (
              species.phylum.toLowerCase() === phylum.toLowerCase() &&
              species.class.toLowerCase() === className.toLowerCase() &&
              species.order.toLowerCase() === order.toLowerCase()
            );
          return false;
        });

      return matchesSearch && matchesTaxonomy;
    });
  }, [fetchedSpecies, searchQuery, selectedTaxonomy, loading]);

  const handleTaxonomyChange = (newValue: string[]) => {
    setSelectedTaxonomy(newValue);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className='h-screen'>
      <ParkHeader cardClassName="md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">Taxonomy</div>
          {/* <div className="backdrop-blur bg-white/15 px-3 h-8 flex items-center rounded-full">{selectedPark?.name}</div> */}
        </div>
      </ParkHeader>
      <div
        className="p-2 items-center bg-green-50 mt-[-3.5rem] 
        backdrop-blur bg-white/10 mx-4 rounded-2xl px-4
        md:flex-row md:-mt-[5.5rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4"
      >
        <Input
          suffix={<FiSearch />}
          placeholder="Search Species..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3] "
        />
        {selectedTaxonomy?.length > 0 && <div className='text-sm text-black/50 mb-1 ml-1 md:text-white/75'>Filters:</div>}
        <TreeSelect
          treeData={treeData}
          value={selectedTaxonomy}
          onChange={handleTaxonomyChange}
          treeCheckable={true}
          showCheckedStrategy={SHOW_PARENT}
          placeholder={<div className="md:text-white/75 text-green-700">{`Filter by Phylum > Class > Order`}</div>}
          className="w-full cursor-pointermd:flex-1 md:min-w-[260px] mb-2"
          variant="borderless"
          treeNodeLabelProp="kekek"
          suffixIcon={<IoIosArrowDown className="md:text-gray-400 text-green-700 text-lg cursor-pointer"/>}
          tagRender={(item) => <Tag bordered={false} >{item.label}</Tag>}
        />
        {selectedTaxonomy?.length > 0 && <div className='h-[1px] w-full bg-black/5'/>}
      </div>
      {!filteredSpecies || filteredSpecies.length == 0 ? (
        <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
          <PiPlantFill className="text-4xl mb-2 mt-10" />
          No Species found.
          </div>
      ) : (
        <div className="justify-center max-h-[calc(100vh-20rem)] overflow-y-auto no-scrollbar border-slate-200 border-b-[1px] md:mt-6">
          {/* <div className="flex flex-col items-center max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar"> */}
            {filteredSpecies.map((species, index) => (
              // <Card key={species.id} className={cardStyle} styles={{ body: { padding: 0 } }} onClick={() => navigateToSpecies(species.id)}>
              <div className='w-full text-left inline-flex items-center border-x-transparent py-2 px-4 cursor-pointer border-slate-200 border-t-[1px] hover:bg-green-600/10' onClick={() => navigateToSpecies(species.id)}>
                <div className="flex flex-row">
                  <div className="w-[60px] h-[60px] flex-shrink-0 mr-2 overflow-hidden rounded-full">
                    <img
                      src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQLDJn8tSD57Z5Wy8t3nFbaiEG52OP0fK1lTXOckm1CuzNTGrR0"
                      alt={species.commonName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-full">
                    <div className={speciesTitleStyle}>{species.commonName}</div>
                    <div className='-mt-[2px] text-green-700/80 italic'>{species.speciesName}</div>
                  </div>
                </div>
                </div>
              // </Card>
            ))}
        </div>
      )}
    </div>
  );
};

{/* <div className="justify-center bg-green-50 max-h-[calc(100vh-20rem)] overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar">
          {filteredSpecies.map((species, index) => (
            <Card key={index} className={cardStyle} styles={{ body: { padding: 10 } }} onClick={() => navigateToSpecies(species.id)}>
              <div className="flex flex-row items-center">
                <div className="w-[60px] h-[60px] flex-shrink-0 mr-2 overflow-hidden rounded">
                  <img
                    src={species.images[0]}
                    alt={species.commonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pl-1">
                  <h2 className={speciesTitleStyle}>{species.commonName}</h2>
                  <p>{species.speciesName}</p>
                </div>
              </div>
            </Card>
          ))}
        </div> */}

const TreeSelectNoOverflow = styled(TreeSelect)`
  .ant-select-selection-overflow {
    flex-wrap: nowrap;
    overflow-x: hidden;
    display: none;
  }
`;

export default Discover;
