import React from 'react';
import { EventTicketTransactionResponse } from '@lepark/data-access';
import dayjs from 'dayjs';

interface DetailedEventTransactionCardProps {
  transaction: EventTicketTransactionResponse;
  onClick: () => void;
}

const DetailedEventTransactionCard: React.FC<DetailedEventTransactionCardProps> = ({ transaction, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={onClick}>
      <img src={transaction?.event?.images?.[0]} alt={transaction?.event?.title} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4 space-y-2">
        <h4 className="text-xl font-bold m-0">{transaction.event?.title}</h4>
        <p className="font-semibold">{dayjs(transaction.eventDate).format('MMMM D, YYYY')}</p>
        <p>Total paid: ${transaction.totalAmount.toFixed(2)}</p>
        {/* <p>Number of tickets: {transaction.eventTickets.length}</p>
        <div className="flex flex-wrap gap-2">
          {transaction.eventTickets.map((ticket, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {ticket.eventTicketListing.ticketType}
            </span>
          ))}
        </div>
        <p className="text-gray-500">Transaction ID: {transaction.id}</p> */}
      </div>
    </div>
  );
};

export default DetailedEventTransactionCard;
