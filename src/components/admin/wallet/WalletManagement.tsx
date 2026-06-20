import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Download, Upload, Settings } from 'lucide-react';

interface WalletManagementProps {
  userId?: string;
}

export function WalletManagement({ userId }: WalletManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Wallet Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Search */}
        {!userId && (
          <div className="space-y-2">
            <Label>Search User</Label>
            <div className="flex gap-2">
              <Input placeholder="Enter user ID or email" />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Balance Adjustment */}
        <div className="space-y-2">
          <Label>Adjust Balance</Label>
          <div className="flex gap-2">
            <Input type="number" placeholder="Amount" />
            <Button variant="outline">Credit</Button>
            <Button variant="outline">Debit</Button>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="space-y-2">
          <Label>Wallet Status</Label>
          <div className="flex gap-2">
            <Button variant="outline">Suspend</Button>
            <Button variant="outline">Freeze</Button>
            <Button variant="outline">Activate</Button>
          </div>
        </div>

        {/* Bulk Operations */}
        <div className="space-y-2">
          <Label>Bulk Operations</Label>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
