import { ContentWrapper, Divider, LogoText } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space, TreeSelect, Input } from "antd";
import { useNavigate, useLocation } from 'react-router-dom'
import { plantTaxonomy } from "@lepark/data-utility";
import { useState, useEffect, useMemo } from 'react';
import { getAllSpecies, SpeciesResponse } from '@lepark/data-access';
import { FiSearch } from "react-icons/fi";

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
  const cardStyle = "w-[95%] text-left md:w-1/2 m-1 !p-0.01 inline-flex items-center";
  const speciesTitleStyle = "text-xl font-medium text-green-500";
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
      const matchesSearch = species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            species.speciesName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTaxonomy = selectedTaxonomy.length === 0 || selectedTaxonomy.some((tax) => {
        const [level, phylum, className, order] = tax.split('-');
        if (level === 'phylum') return species.phylum.toLowerCase() === phylum.toLowerCase();
        if (level === 'class') return species.phylum.toLowerCase() === phylum.toLowerCase() &&
                                    species.class.toLowerCase() === className.toLowerCase();
        if (level === 'order') return species.phylum.toLowerCase() === phylum.toLowerCase() &&
                                    species.class.toLowerCase() === className.toLowerCase() &&
                                    species.order.toLowerCase() === order.toLowerCase();
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
    <div>
      <Card
        size="small"
        style={{
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden'
        }}
        className="mb-2 w-full h-28 bg-green-400 rounded-2xl -z-10 md:w-full md:rounded md:h-64"
      >
        <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex">
          <div className="md:text-center md:mx-auto">
            <p className="font-medium">Bishan Park</p>
            <p className="font-medium text-2xl md:text-3xl">Discover</p>
          </div>
        </div>
      </Card>

      <div className="p-2 flex flex-col md:flex-row justify-between items-center bg-green-50">
        <TreeSelect
          treeData={treeData}
          value={selectedTaxonomy}
          onChange={handleTaxonomyChange}
          treeCheckable={true}
          showCheckedStrategy={SHOW_PARENT}
          placeholder="Filter by Phylum > Class > Order"
          style={{ width: '98%', marginBottom: '10px'}}
        />
        <Input
          suffix={<FiSearch />}
          placeholder="Search species..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '98%' }}
        />
      </div>

      <div className="justify-center bg-green-50 max-h-[calc(100vh-20rem)] overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar">
          {filteredSpecies.map((species, index) => (
            <Card
              key={index}
              className={cardStyle}
              styles={{ body: { padding: 10 } }}
              onClick={() => {
                navigate('/discover/view-species', {
                  state: { speciesId: species.id }
                });
              }}
            >
              <div className="flex flex-row items-center">
                <div className="w-[60px] h-[60px] flex-shrink-0 mr-2 overflow-hidden rounded">
                  <img
                    src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQLDJn8tSD57Z5Wy8t3nFbaiEG52OP0fK1lTXOckm1CuzNTGrR0"
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
        </div>
      </div>
    </div>
  );
};

export default Discover;
