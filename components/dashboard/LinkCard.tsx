'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from './DashboardLayout';
import { Edit, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LinkCardProps {
  link: Link;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { title: string; url: string; description: string }) => void;
}

export default function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: link.title,
    url: link.url,
    description: link.description
  });

  const handleEdit = () => {
    onEdit(link.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(link.id);
    setShowDeleteDialog(false);
  };

  const handleVisit = () => {
    window.open(link.url, '_blank');
  };

  if (isEditing) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Title"
          />
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="URL"
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Description"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{link.title}</h3>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-500 hover:text-blue-700 break-all mb-2 flex items-center"
              >
                {link.url}
                <ExternalLink className="h-4 w-4 ml-1 inline" />
              </a>
              {link.description && (
                <p className="text-sm text-gray-600 mt-2">{link.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Added {new Date(link.created_at).toLocaleDateString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleVisit}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Link
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this link. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
