import { Button, Empty } from 'antd';
import { BiSolidCalendarEvent } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { TbTicket } from 'react-icons/tb';

export interface HoverItem {
  id: string;
  title: string | JSX.Element | JSX.Element[];
  image?: string | null;
  showImage?: boolean;
  entityType: string;
  children?: string | JSX.Element | JSX.Element[];
}

interface HoverInformationProps {
  item: HoverItem;
  setHovered: (hover: any) => void;
}

const HoverInformation = ({ item, setHovered }: HoverInformationProps) => {
  const { title, image, entityType, children, showImage = true } = item;
// let { showImage } = item;

  // console.log(showImage)
  // if (showImage === undefined || showImage === null) {
  //   showImage = true;
  // }
  return (
    <div
      style={{
        position: 'absolute',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
      className="rounded-lg bg-white/90 p-4 border-lg box-shadow w-full bottom-0 shadow-lg md:m-2 md:left-0 md:w-[350px]"
    >
      <div className="absolute z-20 -mt-8 flex justify-between w-full pr-8">
        {entityType === 'EVENT' ? (
          <div className="h-10 rounded-full bg-sky-400 flex items-center px-4">
            <BiSolidCalendarEvent className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Event</div>
          </div>
        ) : entityType === 'FACILITY' ? (
          <div className="h-10 rounded-full bg-gray-500 flex items-center px-4">
            <div className="text-base text-white font-semibold">Facility</div>
          </div>
        ) : entityType === 'ATTRACTION' ? (
          <div className="h-10 rounded-full bg-mustard-400 flex items-center px-4">
            <TbTicket className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Attraction</div>
          </div>
        ) : entityType === 'OCCURRENCE' ? (
          <div className="h-10 rounded-full bg-green-400 flex items-center px-4">
            <TbTicket className="text-lg text-white" />
            <div className="text-base text-white font-semibold ml-2">Occurrence</div>
          </div>
        ) :
        <div className="h-10 rounded-full bg-sky-400 flex items-center px-4">
          <BiSolidCalendarEvent className="text-lg text-white" />
          <div className="text-base text-white font-semibold ml-2">Marker</div>
        </div>
        }

        <Button shape="circle" icon={<IoMdClose />} onClick={() => setHovered(null)}></Button>
      </div>

      {showImage ? <div
        style={{
          width: '100%',
          backgroundImage: `url('${image ? image : ''}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="rounded-lg h-24 shadow-md flex items-center justify-center text-white shrink-0 bg-gray-400 mb-2 overflow-hidden"
      >
        {!image && <Empty description="No Image" />}
      </div>: <div className='h-3 w-full'></div>  
    }
      <div className="font-semibold text-base mb-1">{title}</div>
      <div className='pb-1'>
        {children}
      </div>
    </div>
  );
};

export default HoverInformation;
