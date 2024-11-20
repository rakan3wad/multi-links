"use client";

import { ExternalLink } from "lucide-react";
import { Link } from "../dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PublicProfileProps {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  links: Link[];
}

export default function PublicProfile({ username, displayName, avatarUrl, links }: PublicProfileProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || undefined} alt={username} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-3xl">
              {displayName && <div className="mb-1">{displayName}</div>}
              <div className="text-muted-foreground">@{username}</div>
            </CardTitle>
            <CardDescription>My Collection of Links</CardDescription>
          </CardHeader>
        </Card>

        {/* Links Grid */}
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">{link.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {new URL(link.url).hostname.replace('www.', '')}
                      </Badge>
                    </div>
                    {link.description && (
                      <p className="text-muted-foreground">{link.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {links.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CardTitle className="text-lg mb-2">No links added yet</CardTitle>
                <CardDescription>
                  This user hasn't added any links to their profile
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
