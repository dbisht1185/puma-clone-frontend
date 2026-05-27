"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Checkbox,
  Slider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FilterDatas } from "@/constant/Products/FilterData";

const FilterAccordian = ({ 
  filters = {
    categories: [],
    sizes: [],
    colors: [],
    priceRange: [0, 45999],
    discount: [],
    gender: [],
  },
  onFiltersChange,
  filterCounts = {
    gender: {},
    color: {},
    discount: {},
    category: {},
    size: {},
  }
}) => {
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange || [0, 45999]);
  const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
  const [selectedSizes, setSelectedSizes] = useState(filters.sizes || []);
  const [selectedColors, setSelectedColors] = useState(filters.colors || []);
  const [selectedDiscounts, setSelectedDiscounts] = useState(filters.discount || []);
  const [selectedGenders, setSelectedGenders] = useState(filters.gender || []);

  // Sync local state with props
  useEffect(() => {
    setLocalPriceRange(filters.priceRange || [0, 45999]);
    setSelectedCategories(filters.categories || []);
    setSelectedSizes(filters.sizes || []);
    setSelectedColors(filters.colors || []);
    setSelectedDiscounts(filters.discount || []);
    setSelectedGenders(filters.gender || []);
  }, [filters]);

  // Handle price slider change
  const handlePriceChange = (event, newValue) => {
    setLocalPriceRange(newValue);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        priceRange: newValue,
      });
    }
  };

  // Handle manual price input change
  const handleInputChange = (index, value) => {
    let newPriceRange = [...localPriceRange];
    const numericValue = value.replace(/\D/g, "");

    if (numericValue === "") {
      newPriceRange[index] = "";
    } else {
      const parsedValue = parseInt(numericValue, 10);
      if (index === 0) {
        newPriceRange[index] = Math.max(0, Math.min(parsedValue, localPriceRange[1]));
      } else {
        newPriceRange[index] = Math.min(45999, Math.max(parsedValue, localPriceRange[0]));
      }
    }

    setLocalPriceRange(newPriceRange);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        priceRange: newPriceRange,
      });
    }
  };

  // Handle input blur
  const handleInputBlur = (index) => {
    let newPriceRange = [...localPriceRange];
    if (newPriceRange[index] === "" || isNaN(newPriceRange[index])) {
      newPriceRange[index] = index === 0 ? 0 : 45999;
    }
    setLocalPriceRange(newPriceRange);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        priceRange: newPriceRange,
      });
    }
  };

  // Handle category checkbox
  const handleCategoryToggle = (value) => {
    const newCategories = selectedCategories.includes(value)
      ? selectedCategories.filter((c) => c !== value)
      : [...selectedCategories, value];
    setSelectedCategories(newCategories);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        categories: newCategories,
      });
    }
  };

  // Handle size selection
  const handleSizeToggle = (value) => {
    const newSizes = selectedSizes.includes(value)
      ? selectedSizes.filter((s) => s !== value)
      : [...selectedSizes, value];
    setSelectedSizes(newSizes);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        sizes: newSizes,
      });
    }
  };

  // Handle color selection
  const handleColorToggle = (value) => {
    const newColors = selectedColors.includes(value)
      ? selectedColors.filter((c) => c !== value)
      : [...selectedColors, value];
    setSelectedColors(newColors);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        colors: newColors,
      });
    }
  };

  // Handle discount checkbox
  const handleDiscountToggle = (value) => {
    const newDiscounts = selectedDiscounts.includes(value)
      ? selectedDiscounts.filter((d) => d !== value)
      : [...selectedDiscounts, value];
    setSelectedDiscounts(newDiscounts);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        discount: newDiscounts,
      });
    }
  };

  // Handle gender checkbox
  const handleGenderToggle = (value) => {
    const newGenders = selectedGenders.includes(value)
      ? selectedGenders.filter((g) => g !== value)
      : [...selectedGenders, value];
    setSelectedGenders(newGenders);
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        gender: newGenders,
      });
    }
  };

  return (
    <div className="w-full">
      {FilterDatas.map((section, index) => (
        <Accordion
          key={index}
          expanded={expandedIndexes.includes(index)}
          onChange={() =>
            setExpandedIndexes((prev) =>
              prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
            )
          }
          sx={{ boxShadow: "none", border: "none" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}>
            <Typography variant="h6" className="font-bold">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ paddingBottom: "16px" }}>
            {section.title === "Category" && (
              <div className="w-full flex flex-col">
                {section.items.map((item, idx) => {
                  const count = filterCounts.category[item.value] || 0;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedCategories.includes(item.value)}
                        onChange={() => handleCategoryToggle(item.value)}
                        size="medium"
                        sx={{ "&.Mui-checked": { color: "#191919" } }}
                      />
                      <div 
                        className="flex gap-1 cursor-pointer"
                        onClick={() => handleCategoryToggle(item.value)}>
                        <span>{item.name}</span>
                        <span className="text-[#B8B8B8]">[{count}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {section.title === "Price" && (
              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-center gap-4">
                  <div className="relative w-[180px]">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-600">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={localPriceRange[0]}
                      onChange={(e) => handleInputChange(0, e.target.value)}
                      onBlur={() => handleInputBlur(0)}
                      className="w-full h-[60px] pl-7 pr-2 border border-black rounded cursor-text"
                    />
                  </div>

                  <div className="relative w-[180px]">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-600">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={localPriceRange[1]}
                      onChange={(e) => handleInputChange(1, e.target.value)}
                      onBlur={() => handleInputBlur(1)}
                      className="w-full h-[60px] pl-7 pr-2 border border-black rounded cursor-text"
                    />
                  </div>
                </div>

                <Slider
                  min={0}
                  max={45999}
                  value={localPriceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="off"
                  sx={{
                    "& .MuiSlider-thumb": {
                      backgroundColor: "black",
                      width: "30px",
                      height: "30px",
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "black",
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "#ccc",
                    },
                    "& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible, & .MuiSlider-thumb.Mui-active": {
                      boxShadow: "none",
                    },
                  }}
                />
              </div>
            )}

            {section.title === "Gender" && (
              <div className="w-full flex flex-col">
                {section.items.map((item, idxs) => {
                  const count = filterCounts.gender[item.value] || 0;
                  return (
                    <div key={idxs} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedGenders.includes(item.value)}
                        onChange={() => handleGenderToggle(item.value)}
                        size="medium"
                        sx={{ "&.Mui-checked": { color: "#191919" } }}
                      />
                      <div 
                        className="flex gap-1 cursor-pointer"
                        onClick={() => handleGenderToggle(item.value)}>
                        <span>{item.name}</span>
                        <span className="text-[#B8B8B8]">[{count}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {section.title === "Size" && (
              <div className="w-full grid grid-cols-5 gap-5">
                {section.items.map((item, ind) => (
                  <div
                    key={ind}
                    onClick={() => handleSizeToggle(item.value)}
                    className={`w-full border flex items-center justify-center p-2 cursor-pointer transition-colors ${
                      selectedSizes.includes(item.value)
                        ? "border-black bg-black text-white"
                        : "border-[#DFE0E1] hover:border-black"
                    }`}>
                    {item.name}
                  </div>
                ))}
              </div>
            )}

            {section.title === "Color" && (
              <div className="w-full grid grid-cols-4 gap-2 pl-5">
                {section.items.map((item, ind) => {
                  const count = filterCounts.color[item.value] || 0;
                  return (
                    <div
                      key={ind}
                      onClick={() => handleColorToggle(item.value)}
                      className={`flex flex-col items-center gap-2 cursor-pointer px-2 min-w-[80px] ${
                        selectedColors.includes(item.value) ? "opacity-100" : "opacity-70 hover:opacity-100"
                      }`}>
                      <div
                        className={`w-10 h-10 border rounded-full flex items-center ${
                          selectedColors.includes(item.value)
                            ? "border-2 border-black ring-2 ring-gray-400"
                            : "border border-gray-300"
                        }`}
                        style={{
                          background:
                            item.value === "multi-colored"
                              ? "linear-gradient(45deg, red, blue, yellow, green)"
                              : item.bgColor,
                        }}></div>

                      <div className="flex gap-1 items-center text-[15px] pb-2 justify-center whitespace-nowrap">
                        <span>{item.name}</span>
                        <span className="text-gray-500 text-[14px]">
                          [{count}]
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {section.title === "Discount" && (
              <div className="w-full flex flex-col">
                {section.items.map((item, idxs) => {
                  const count = filterCounts.discount[item.value] || 0;
                  return (
                    <div key={idxs} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedDiscounts.includes(item.value)}
                        onChange={() => handleDiscountToggle(item.value)}
                        size="medium"
                        sx={{ "&.Mui-checked": { color: "#191919" } }}
                      />
                      <div 
                        className="flex gap-1 cursor-pointer"
                        onClick={() => handleDiscountToggle(item.value)}>
                        <span>{item.name}%</span>
                        <span className="text-[#B8B8B8]">[{count}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default FilterAccordian;
