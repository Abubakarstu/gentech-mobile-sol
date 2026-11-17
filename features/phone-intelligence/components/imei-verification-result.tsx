'use client';

import type { ImeiVerificationResult } from '../schemas/imei.schema';

interface ImeiVerificationResultProps {
  verification: ImeiVerificationResult;
}

export function ImeiVerificationResultCard({ verification }: ImeiVerificationResultProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = () => {
    if (verification.isStolen || verification.isBlacklisted) {
      return { level: 'HIGH', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (verification.ptaStatus === 'APPROVED' || verification.cpidStatus === 'APPROVED') {
      return { level: 'LOW', color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { level: 'UNKNOWN', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const risk = getRiskLevel();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">IMEI Verification</h3>
          <p className="text-sm text-gray-500 font-mono">{verification.imei}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${risk.bg} ${risk.color}`}>
          {verification.isSimulated ? 'Simulated' : `Risk: ${risk.level}`}
        </div>
      </div>

      {verification.isSimulated && (
        <div
          role="note"
          className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
        >
          <strong>Simulated result (test mode).</strong> This IMEI was not checked with PTA
          or CPID. Use it only to exercise the flow and never as proof that a device is
          registered, import-compliant, or clean.
        </div>
      )}
      {verification.isStale && (
        <div
          role="note"
          className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs leading-5 text-yellow-900"
        >
          This status is older than 24 hours and could not be refreshed. Re-check before
          relying on it.
        </div>
      )}

      <div className="space-y-4">
        {/* PTA Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-700">PTA Status</div>
            <div className="text-xs text-gray-500">Pakistan Telecommunication Authority</div>
          </div>
          {verification.ptaStatus && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(verification.ptaStatus)}`}>
              {verification.ptaStatus}
            </span>
          )}
        </div>

        {/* CPID Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-700">CPID Status</div>
            <div className="text-xs text-gray-500">Compliant Device Identification</div>
          </div>
          {verification.cpidStatus && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(verification.cpidStatus)}`}>
              {verification.cpidStatus}
            </span>
          )}
        </div>

        {/* Security Checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Stolen Device Check</span>
            <span className={`text-sm font-medium ${verification.isStolen ? 'text-red-600' : 'text-green-600'}`}>
              {verification.isStolen ? '⚠️ Flagged' : '✓ Clear'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Blacklist Check</span>
            <span className={`text-sm font-medium ${verification.isBlacklisted ? 'text-red-600' : 'text-green-600'}`}>
              {verification.isBlacklisted ? '⚠️ Flagged' : '✓ Clear'}
            </span>
          </div>
        </div>

        {/* Device Info */}
        {(verification.deviceModel || verification.deviceBrand || verification.deviceColor) && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Device Information</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {verification.deviceBrand && (
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <span className="ml-1">{verification.deviceBrand}</span>
                </div>
              )}
              {verification.deviceModel && (
                <div>
                  <span className="text-gray-500">Model:</span>
                  <span className="ml-1">{verification.deviceModel}</span>
                </div>
              )}
              {verification.deviceColor && (
                <div>
                  <span className="text-gray-500">Color:</span>
                  <span className="ml-1">{verification.deviceColor}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Metadata */}
        <div className="text-xs text-gray-500 border-t pt-3">
          {verification.verifiedAt && (
            <div>
              {verification.isSimulated ? 'Simulated at' : 'Last verified'}:{' '}
              {new Date(verification.verifiedAt).toLocaleString()}
            </div>
          )}
          {verification.verificationSource && (
            <div>
              Source:{' '}
              {verification.verificationSource === 'SIMULATED'
                ? 'Simulated (test data)'
                : verification.verificationSource}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
