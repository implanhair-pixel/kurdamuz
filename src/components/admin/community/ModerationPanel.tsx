'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ModerationPanelProps {
  report: any;
  onAction: (data: any) => void;
  onDismiss: (reportId: string) => void;
}

const MODERATION_ACTIONS = [
  { value: 'approve', label: 'Approve Content', icon: CheckCircle, color: 'text-green-500' },
  { value: 'remove', label: 'Remove Content', icon: XCircle, color: 'text-red-500' },
  { value: 'warn', label: 'Warn User', icon: AlertTriangle, color: 'text-orange-500' },
  { value: 'restrict_temp', label: 'Temporary Restriction', icon: Shield, color: 'text-yellow-500' },
  { value: 'restrict_perm', label: 'Permanent Restriction', icon: Shield, color: 'text-red-500' },
];

export function ModerationPanel({ report, onAction, onDismiss }: ModerationPanelProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAction({
        targetType: report.targetType,
        targetId: report.targetId,
        actionType: selectedAction,
        reason,
      });
      
      // Update report status
      await onAction({
        reportId: report.id,
        status: 'resolved',
      });
      
      setSelectedAction('');
      setReason('');
    } catch (error) {
      console.error('Error submitting moderation action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Moderation Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{report.reportReason}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium mb-1">
            {report.targetType}: {report.targetId}
          </p>
          {report.reportDetails && (
            <p className="text-sm text-muted-foreground">{report.reportDetails}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Moderation Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {MODERATION_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${action.color}`} />
                        {action.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!selectedAction || !reason || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Apply Action'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onDismiss(report.id)}
            >
              Dismiss Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
