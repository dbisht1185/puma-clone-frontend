"use client";

import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React, { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useToast } from "@/context/toaster";
import { useCart } from "@/context/CartContext";
import { getPromoFromStorage, savePromoToStorage } from "@/utils/promoStorage";

// Mock promo codes - replace with API call
const validPromoCodes = {
  SAVE10: { discount: 0.1, type: "PERCENT" },
  FLAT500: { discount: 500, type: "FLAT" },
  WELCOME20: { discount: 0.2, type: "PERCENT" },
};

const ApplyPromo = ({ onPromoApplied }) => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const { getCartTotals, cart } = useCart();
  const { setAlert } = useToast();

  // Recalculate discount when cart changes (only if promo is already applied)
  useEffect(() => {
    if (appliedPromo) {
      const { subtotal } = getCartTotals();
      const promo = validPromoCodes[appliedPromo.code];
      
      if (promo) {
        let discountAmount = 0;
        if (promo.type === "PERCENT") {
          discountAmount = subtotal * promo.discount;
        } else {
          discountAmount = Math.min(promo.discount, subtotal);
        }
        
        const updatedPromo = { ...appliedPromo, discount: discountAmount };
        setAppliedPromo(updatedPromo);
        savePromoToStorage(updatedPromo);
        onPromoApplied?.(discountAmount);
      }
    } else {
      // Ensure discount is 0 when no promo is applied
      onPromoApplied?.(0);
    }
  }, [cart, appliedPromo?.code, getCartTotals, onPromoApplied]);

  // Mock promo codes - replace with API call
  const validPromoCodes = {
    SAVE10: { discount: 0.1, type: "PERCENT" },
    FLAT500: { discount: 500, type: "FLAT" },
    WELCOME20: { discount: 0.2, type: "PERCENT" },
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setAlert({
        open: true,
        message: "Please enter a promo code",
        severity: "warning",
      });
      return;
    }

    const promo = validPromoCodes[promoCode.toUpperCase()];

    if (!promo) {
      setAlert({
        open: true,
        message: "Invalid promo code",
        severity: "error",
      });
      return;
    }

    // TODO: Replace with actual API call
    // try {
    //   const response = await fetch('/api/promo/validate', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ code: promoCode })
    //   });
    //   const data = await response.json();
    //   if (data.valid) {
    //     setAppliedPromo(data);
    //     calculateDiscount(data);
    //   }
    // } catch (error) {
    //   setAlert({ open: true, message: "Error applying promo code", severity: "error" });
    // }

    const { subtotal } = getCartTotals();
    let discountAmount = 0;

    if (promo.type === "PERCENT") {
      discountAmount = subtotal * promo.discount;
    } else {
      discountAmount = Math.min(promo.discount, subtotal);
    }

    const newPromo = { code: promoCode.toUpperCase(), discount: discountAmount };
    setAppliedPromo(newPromo);
    savePromoToStorage(newPromo);
    onPromoApplied?.(discountAmount);

    setAlert({
      open: true,
      message: "Promo code applied successfully",
      severity: "success",
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    savePromoToStorage(null);
    onPromoApplied?.(0);
    setAlert({
      open: true,
      message: "Promo code removed",
      severity: "info",
    });
  };

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
            APPLY A PROMO CODE
            {appliedPromo && (
              <span className="ml-2 text-sm text-green-600">
                ({appliedPromo.code} applied)
              </span>
            )}
          </span>
        </AccordionSummary>
        <AccordionDetails className="!px-0 !py-5">
          {appliedPromo ? (
            <div className="w-full flex items-center justify-between gap-2">
              <div className="text-sm text-gray-700">
                Promo code <strong>{appliedPromo.code}</strong> applied
              </div>
              <button
                onClick={handleRemovePromo}
                className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400">
                REMOVE
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter a promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleApplyPromo()}
                  className="w-full border border-gray-300 px-4 py-4 text-gray-700 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Promo code input"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-gray-300 text-gray-700 font-bold py-4 px-7 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-label="Apply promo code">
                  APPLY
                </button>
              </div>
              
              {/* Sample Promo Codes */}
              <div className="w-full">
                <div className="text-sm text-gray-600 mb-2 font-semibold">Sample Promo Codes:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(validPromoCodes).map((code) => {
                    const promo = validPromoCodes[code];
                    const discountText = promo.type === "PERCENT" 
                      ? `${(promo.discount * 100)}% OFF` 
                      : `₹${promo.discount} OFF`;
                    
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setPromoCode(code);
                          // Apply promo code directly
                          const promo = validPromoCodes[code];
                          const { subtotal } = getCartTotals();
                          let discountAmount = 0;

                          if (promo.type === "PERCENT") {
                            discountAmount = subtotal * promo.discount;
                          } else {
                            discountAmount = Math.min(promo.discount, subtotal);
                          }

                          setAppliedPromo({ code: code, discount: discountAmount });
                          onPromoApplied?.(discountAmount);

                          setAlert({
                            open: true,
                            message: "Promo code applied successfully",
                            severity: "success",
                          });
                        }}
                        className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                        aria-label={`Apply promo code ${code}`}
                        data-testid={`promo-sample-${code}`}>
                        <span className="font-bold">{code}</span>
                        <span className="text-gray-600 ml-1">- {discountText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default ApplyPromo