import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Settings, Play, Pause } from 'lucide-react';

export function MissionManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Mission Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Mission */}
        <div className="space-y-2">
          <Label>Create New Mission</Label>
          <div className="flex gap-2">
            <Input placeholder="Mission name" />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Schedule Mission */}
        <div className="space-y-2">
          <Label>Schedule Mission</Label>
          <div className="flex gap-2">
            <Input type="date" />
            <Input type="date" />
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Mission Controls */}
        <div className="space-y-2">
          <Label>Mission Controls</Label>
          <div className="flex gap-2">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          </div>
        </div>

        {/* Reset Policy */}
        <div className="space-y-2">
          <Label>Reset Policy</Label>
          <div className="flex gap-2">
            <Button variant="outline">Daily</Button>
            <Button variant="outline">Weekly</Button>
            <Button variant="outline">Custom</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
