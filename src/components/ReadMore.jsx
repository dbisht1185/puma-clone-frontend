"use client";

import React, { useState } from "react";

/**
 * ReadMore component for truncating long text with expand/collapse functionality
 * @param {string} text - Full text to display
 * @param {number} maxLength - Maximum characters to show before truncation
 * @param {string} className - Additional CSS classes
 */
const ReadMore = ({ text, maxLength = 150, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : `${text.slice(0, maxLength)}...`;

  if (!shouldTruncate) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div className={className}>
      <div>{displayText}</div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[15px] font-bold leading-4 border-b-2 cursor-pointer mt-2 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
        aria-label={isExpanded ? "Read less" : "Read more"}
        aria-expanded={isExpanded}>
        {isExpanded ? "READ LESS" : "READ MORE"}
      </button>
    </div>
  );
};

export default ReadMore;

