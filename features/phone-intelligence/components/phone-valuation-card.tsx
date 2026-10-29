'use client';

import type { PhoneValuationResult } from '../schemas/valuation.schema';

interface PhoneValuationCardProps {
  valuation: PhoneValuationResult;
}

export function PhoneValuationCard({ valuation }: PhoneValuationCardProps) {
  const priceRange = valuation.estimatedPriceMax - valuation.estimatedPriceMin;
  const avgPosition = ((valuation.estimatedPriceAvg - valuation.estimatedPriceMin) / priceRange) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{valuation.modelName}</h3>
          <p className="text-sm text-gray-500">{valuation.brandName}</p>
        </div>
        {valuation.isPreview && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            Preview
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Estimated Market Value</span>
            <span className="font-semibold">
              PKR {valuation.estimatedPriceAvg.toLocaleString()}
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-blue-600 rounded-full"
              style={{ left: '0%', width: `${avgPosition}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>PKR {valuation.estimatedPriceMin.toLocaleString()}</span>
            <span>PKR {valuation.estimatedPriceMax.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {valuation.storage && (
            <div>
              <span className="text-gray-500">Storage:</span>
              <span className="ml-2 font-medium">{valuation.storage}</span>
            </div>
          )}
          {valuation.ram && (
            <div>
              <span className="text-gray-500">RAM:</span>
              <span className="ml-2 font-medium">{valuation.ram}</span>
            </div>
          )}
          {valuation.condition && (
            <div>
              <span className="text-gray-500">Condition:</span>
              <span className="ml-2 font-medium">{valuation.condition}</span>
            </div>
          )}
          {valuation.batteryHealth !== null && (
            <div>
              <span className="text-gray-500">Battery:</span>
              <span className="ml-2 font-medium">{valuation.batteryHealth}%</span>
            </div>
          )}
        </div>

        {valuation.sampleCount !== null && (
          <div className="text-xs text-gray-500 border-t pt-3">
            Based on {valuation.sampleCount} active listings
          </div>
        )}
      </div>
    </div>
  );
}
