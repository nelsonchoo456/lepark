import { useAuth } from '@lepark/common-ui';
import { deleteOccurrence, OccurrenceResponse, StaffResponse, getSpeciesById } from '@lepark/data-access';
import { Button, Flex, message, Table, TableProps, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { FiArchive, FiEye, FiSearch } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchOccurrencesForDecarbArea } from '../../../hooks/Decarb/useFetchOccurrrencesForDecarbArea';
import { Input } from 'antd';
import { SCREEN_LG } from '../../../config/breakpoints';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface OccurrenceTableProps {
  decarbAreaId: string;
  loading: boolean;
  excludeOccurrenceId?: string;
  selectedPark?: { id: number };
}

const calculateDailySequestration = (biomass: number, decarbonizationType: string): number => {
  const sequestrationFactors = {
    TREE_TROPICAL: 0.47,
    TREE_MANGROVE: 0.44,
    SHRUB: 0.5,
  };
  const CO2_SEQUESTRATION_FACTOR = 3.67;

  const carbonFraction = sequestrationFactors[decarbonizationType as keyof typeof sequestrationFactors] || 0;
  const annualSequestration = biomass * carbonFraction * CO2_SEQUESTRATION_FACTOR;
  return Number((annualSequestration / 365).toFixed(3)); // Convert annual sequestration to daily rate in kg, always returning 3 decimal places
};

const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ excludeOccurrenceId, selectedPark }) => {
  const { decarbAreaId } = useParams<{ decarbAreaId: string }>();
  const { occurrences, loading, triggerFetch } = useFetchOccurrencesForDecarbArea(decarbAreaId ?? '');
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchQuery, setSearchQuery] = useState('');
  const [occurrencesWithSpecies, setOccurrencesWithSpecies] = useState<(OccurrenceResponse & { speciesName: string })[]>([]);

  useEffect(() => {
    const fetchSpeciesNames = async () => {
      const updatedOccurrences = await Promise.all(
        occurrences.map(async (occurrence) => {
          try {
            const speciesResponse = await getSpeciesById(occurrence.speciesId);
            return { ...occurrence, speciesName: speciesResponse.data.speciesName };
          } catch (error) {
            console.error(`Error fetching species for occurrence ${occurrence.id}:`, error);
            return { ...occurrence, speciesName: 'Unknown Species' };
          }
        })
      );
      setOccurrencesWithSpecies(updatedOccurrences);
    };

    if (occurrences.length > 0) {
      fetchSpeciesNames();
    }
  }, [occurrences]);

  const filteredOccurrences = useMemo(() => {
    return occurrencesWithSpecies
      .filter((occurrence) => occurrence.id !== excludeOccurrenceId)
      .filter((occurrence) =>
        Object.values(occurrence).some((value) => value?.toString().toLowerCase().includes(searchQuery.toLowerCase())),
      );
  }, [searchQuery, occurrencesWithSpecies, excludeOccurrenceId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navigateToDetails = (occurrenceId: string) => {
    navigate(`/occurrence/${occurrenceId}`, { state: { fromDiscoverPerPark: !!selectedPark } });
  };

  const columns: TableProps<OccurrenceResponse & { speciesName: string }>['columns'] = [
    {
      title: 'Occurrence Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text,
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '15%',
    },
    {
      title: 'Image',
      dataIndex: 'images',
      key: 'images',
      render: (images) => images && images.length > 0 ? <img src={images[0]} alt="Occurrence" style={{ width: '50px', height: '50px', objectFit: 'cover' , margin: '0px'}} className="rounded-md"/> : 'No Image',
      sorter: (a, b) => a.images.length - b.images.length,
      width: '8%',
    },
    {
      title: 'Species',
      dataIndex: 'speciesName',
      key: 'speciesName',
      render: (text) => text,
      sorter: (a, b) => a.speciesName.localeCompare(b.speciesName),
      width: '10%',
    },
    {
      title: 'Type',
      dataIndex: 'decarbonizationType',
      key: 'decarbonizationType',
      render: (text) => formatEnumLabelToRemoveUnderscores(text),
      sorter: (a, b) => {
        if (a.decarbonizationType && b.decarbonizationType) {
          return a.decarbonizationType.localeCompare(b.decarbonizationType);
        }
        return 0;
      },
      width: '10%',
    },
    {
      title: 'CO₂ absorbed daily',
      key: 'dailySequestration',
      render: (_, record) => {
        const dailySequestration = calculateDailySequestration(record.biomass, record.decarbonizationType);
        return dailySequestration + " kg";
      },
      sorter: (a, b) => {
        const seqA = calculateDailySequestration(a.biomass, a.decarbonizationType);
        const seqB = calculateDailySequestration(b.biomass, b.decarbonizationType);
        return seqA - seqB;
      },
      width: '15%',
    },
    {
      title: 'Last Observed',
      dataIndex: 'dateObserved',
      key: 'dateObserved',
      render: (text) => moment(text).format('D MMM YY'),
      sorter: (a, b) => moment(a.dateObserved).valueOf() - moment(b.dateObserved).valueOf(),
      width: '10%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex justify="left" gap={8}>
          <Tooltip title="View Details">
            <Button type="link" icon={<FiEye />} onClick={() => navigateToDetails(record.id)} />
          </Tooltip>
        </Flex>
      ),
      width: '10%',
    },
  ];

  return (
    <>
      {contextHolder}
      <Input
        suffix={<FiSearch />}
        placeholder="Search in Occurrences..."
        className="mb-4 bg-white"
        variant="filled"
        onChange={handleSearch}
      />
      <Table
        dataSource={filteredOccurrences}
        columns={columns}
        rowKey="id"
        loading={loading || occurrences.length !== occurrencesWithSpecies.length}
        scroll={{ x: SCREEN_LG }}
      />
    </>
  );
};

export default OccurrenceTable;
