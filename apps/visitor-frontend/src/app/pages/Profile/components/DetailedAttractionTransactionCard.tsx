import React from 'react';
import { AttractionTicketTransactionResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

interface DetailedAttractionTransactionCardProps {
  transaction: AttractionTicketTransactionResponse;
  onClick: () => void;
}

const DetailedAttractionTransactionCard: React.FC<DetailedAttractionTransactionCardProps> = ({ transaction, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      <img
        src={transaction?.attraction?.images?.[0]}
        alt={transaction?.attraction?.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4 space-y-2">
        <h4 className="text-xl font-bold m-0">{transaction.attraction?.title}</h4>
        <p className="font-semibold">{dayjs(transaction.attractionDate).format('MMMM D, YYYY')}</p>
        <p>Total paid: ${transaction.totalAmount.toFixed(2)}</p>
        {/* Commented out sections */}
        {/* <p>Number of tickets: {transaction.attractionTickets.length}</p>
        <div className="flex flex-wrap gap-2">
          {transaction.attractionTickets.map((ticket, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {ticket.ticketListing.nationality} - {ticket.ticketListing.category}
            </span>
          ))}
        </div> */}
        {/* <p className="text-gray-500">Transaction ID: {transaction.id}</p> */}
      </div>
    </div>
  );
};

export default DetailedAttractionTransactionCard;