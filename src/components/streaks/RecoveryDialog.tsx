import { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import type { RecoveryType } from '@/types/streak';

interface RecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { missedDate: Date; recoveryType: RecoveryType; reason: string }) => void;
  isLoading?: boolean;
}

export function RecoveryDialog({ isOpen, onClose, onSubmit, isLoading }: RecoveryDialogProps) {
  const [missedDate, setMissedDate] = useState('');
  const [recoveryType, setRecoveryType] = useState<RecoveryType>('manual');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      missedDate: new Date(missedDate),
      recoveryType,
      reason,
    });
  };

  const recoveryTypes: { value: RecoveryType; label: string; description: string }[] = [
    { value: 'manual', label: 'Manual Request', description: 'Request manual recovery from admin' },
    { value: 'automatic', label: 'Automatic Recovery', description: 'Automatic recovery for streaks ≥ 7 days' },
    { value: 'reward_based', label: 'Reward-Based', description: 'Use rewards to recover streak' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Request Streak Recovery</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Missed Date
            </label>
            <input
              type="date"
              value={missedDate}
              onChange={(e) => setMissedDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recovery Type
            </label>
            <div className="space-y-2">
              {recoveryTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="recoveryType"
                    value={type.value}
                    checked={recoveryType === type.value}
                    onChange={(e) => setRecoveryType(e.target.value as RecoveryType)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Explain why you missed the activity..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/500</p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Recovery requests are subject to approval. You can request up to 3 recoveries per month.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
