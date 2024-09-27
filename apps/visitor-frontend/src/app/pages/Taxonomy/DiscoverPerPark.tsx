import { ContentWrapper, ContentWrapperDark, Divider, LogoText, useAuth } from '@lepark/common-ui';
import MainLayout from '../../components/main/MainLayout';
import { NavButton } from '../../components/buttons/NavButton';
import { PiPlantFill, PiStarFill, PiTicketFill } from 'react-icons/pi';
import { FaTent } from 'react-icons/fa6';
import { Badge, Card, Space, TreeSelect, Input, Tag, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { plantTaxonomy } from '@lepark/data-utility';
import { useState, useEffect, useMemo } from 'react';
import { getAllSpecies, getOccurrencesByParkId, SpeciesResponse, VisitorResponse } from '@lepark/data-access';
import { FiPause, FiSearch } from 'react-icons/fi';
import ParkHeader from '../MainLanding/components/ParkHeader';
import { usePark } from '../../park-context/ParkContext';
import styled from 'styled-components';
import { MdArrowDropDown } from 'react-icons/md';
import { IoIosArrowDown, IoMdHeart, IoMdHeartDislike, IoMdHeartEmpty } from 'react-icons/io';
import { useHandleFavoriteSpecies } from '../../hooks/useHandleFavoriteSpecies';
import { IoEarth } from 'react-icons/io5';
import { convertEnumToNormalFormat } from '@lepark/data-utility';
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

const DiscoverPerPark = () => {
  const navigate = useNavigate();
  const { isFavoriteSpecies, handleRemoveFromFavorites, handleAddToFavorites } = useHandleFavoriteSpecies();
  const { user } = useAuth<VisitorResponse>();
  const { selectedPark } = usePark();
  const [loading, setLoading] = useState(false);
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      try {
        if (selectedPark) {
          const speciesOccurrences = await getOccurrencesByParkId(selectedPark.id);
          const species = await getAllSpecies();
          const speciesWithOccurrences = species.data.filter((s) =>
            speciesOccurrences.data.some((occurrence: { speciesId: string }) => occurrence.speciesId === s.id),
          );
          setFetchedSpecies(speciesWithOccurrences);
        }
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, [selectedPark]);

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/discover/${speciesId}`, { state: { fromDiscoverPerPark: true } });
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

  const renderConservationStatus = (status: string) => {
    let color: string;
    let style: React.CSSProperties = {};
    switch (status) {
      case 'LEAST_CONCERN':
        color = 'green';
        break;
      case 'NEAR_THREATENED':
        color = 'lime';
        break;
      case 'VULNERABLE':
        color = 'orange';
        break;
      case 'ENDANGERED':
        color = 'volcano';
        break;
      case 'CRITICALLY_ENDANGERED':
        color = 'red';
        break;
      case 'EXTINCT_IN_THE_WILD':
        color = 'purple';
        break;
      case 'EXTINCT':
        color = 'white';
        style = { color: 'rgba(0, 0, 0, 0.85)', border: '1px solid #d9d9d9' };
        break;
      default:
        color = 'default';
    }
    return (
      <Tag color={color} style={style}>
        {status.replace(/_/g, ' ')}
      </Tag>
    );
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <ParkHeader cardClassName="h-48 md:h-[160px]">
        <div className="flex w-full md:text-center md:mx-auto md:block md:w-auto">
          <div className="flex-1 font-medium text-2xl md:text-3xl">Taxonomy</div>
          {/* <div className="backdrop-blur bg-white/15 px-3 h-8 flex items-center rounded-full">{selectedPark?.name}</div> */}
        </div>
      </ParkHeader>
      <div
        className="p-2 items-center bg-green-50 mt-[-2.5rem]
        backdrop-blur bg-white/10 mx-4 rounded-2xl px-4
        md:flex-row md:-mt-[5.5rem] md:gap-2 md:backdrop-blur md:bg-white/10 md:mx-4 md:px-4"
      >
        <Input
          suffix={<FiSearch />}
          placeholder="Search Species..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full mb-2 md:flex-[3] "
        />
        {selectedTaxonomy?.length > 0 && <div className="text-sm text-black/50 mb-1 ml-1 md:text-white/75">Filters:</div>}
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
          suffixIcon={<IoIosArrowDown className="md:text-gray-400 text-green-700 text-lg cursor-pointer" />}
          tagRender={(item) => <Tag bordered={false}>{item.label}</Tag>}
        />
        {selectedTaxonomy?.length > 0 && <div className="h-[1px] w-full bg-black/5" />}
      </div>
      {!filteredSpecies || filteredSpecies.length == 0 ? (
        <div className="opacity-40 flex flex-col justify-center items-center text-center w-full">
          <PiPlantFill className="text-4xl mb-2 mt-10" />
          No Species found.
        </div>
      ) : (
        <div
          className="justify-center overflow-y-auto mx-4
          md:mt-6 md:bg-white md:flex-1 md:mb-4 md:rounded-xl md:p-4"
        >
          {filteredSpecies.map((species, index) => (
            <div
              key={species.id} // Add the key prop here
              onClick={() => navigateToSpecies(species.id)}
              className="w-full text-left inline-flex items-center py-2 px-4 cursor-pointer
      bg-white rounded-xl mb-2
      md:border-[1px]
      hover:bg-green-600/10"
            >
              <div className="flex flex-row w-full">
                <div className="w-[80px] h-[80px] flex-shrink-0 mr-2 overflow-hidden rounded-full bg-slate-400/40">
                  <img src={species.images[0]} alt={species.commonName} className="w-full h-full object-cover" />
                </div>
                <div className="h-full flex-1">
                  <div className="text-lg font-semibold text-green-700">{species.commonName}</div>
                  <div className="-mt-[2px] text-green-700/80 italic">{species.speciesName}</div>
                </div>
                <div className="h-full flex-1 hidden md:block">
                  <div className="-mt-[2px] text-green-700/80 italic">Soil: {convertEnumToNormalFormat(species.soilType)}</div>
                  <div className="-mt-[2px] text-green-700/80 italic">Light: {convertEnumToNormalFormat(species.lightType)}</div>
                </div>
                <div className="h-full flex-1 hidden lg:block">
                  <div className="-mt-[2px] ">{renderConservationStatus(species.conservationStatus)}</div>
                  <div className="-mt-[2px] text-green-700/80 italic flex items-center">
                    <IoEarth className="mr-1" />
                    {species.originCountry}
                  </div>
                </div>
                <div className="h-full">
                  {user &&
                    user.isVerified &&
                    (isFavoriteSpecies(species.id) ? (
                      <Button
                        icon={<IoMdHeart className="text-lg text-pastelPink-400" />}
                        shape="circle"
                        type="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(species.id);
                        }}
                      />
                    ) : (
                      <Button
                        icon={<IoMdHeartEmpty className="text-lg text-pastelPink-500" />}
                        shape="circle"
                        type="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToFavorites(species.id);
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverPerPark;
