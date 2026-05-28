import React from 'react'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardDetails from '../cart/CardDetails';
import { useCart } from '@/context/CartContext';

const OrderDetails = () => {
  const { getCartTotals } = useCart();
  const { itemCount } = getCartTotals();
  return (
    <div>
         <Accordion
                className="!bg-transparent !shadow-none !border-none"
                disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="!bg-[#eeeeee] px-4 py-5 !min-h-[60px] flex items-center">
                  <span className="text-base font-semibold text-gray-800">
                    ORDER DETAILS{" "} ({itemCount})
                  </span>
                </AccordionSummary>
                <AccordionDetails className="!px-0 !py-5">
                  <div className="w-full">
                   <CardDetails compact={true} />
                  </div>
                </AccordionDetails>
              </Accordion>
    </div>
  )
}

export default OrderDetails