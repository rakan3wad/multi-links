"use client";

import { useState } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Link } from "./DashboardLayout";
import AddLinkCard from "./AddLinkCard";

interface LinkCardProps {
  link: Link;
  onDelete: (id: string) => void;
  onEdit: (id: string, link: Omit<Link, "id">) => void;
}

export default function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (updatedLink: Omit<Link, "id">) => {
    onEdit(link.id, updatedLink);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <AddLinkCard
        initialData={link}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{link.title}</h3>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600"
            title="Edit"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{link.description}</p>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        Visit Link
        <ExternalLink className="w-4 h-4 ml-1" />
      </a>
    </div>
  );
}
