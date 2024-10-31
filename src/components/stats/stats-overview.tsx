"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  totalAnime: number;
  totalEpisodes: number;
  averageScore: number;
  watchTime: number;
}

export function StatsOverview({ 
  totalAnime, 
  totalEpisodes, 
  averageScore, 
  watchTime 
}: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Anime",
      value: totalAnime,
      unit: "",
    },
    {
      title: "Episodes Watched",
      value: totalEpisodes,
      unit: "eps",
    },
    {
      title: "Average Score",
      value: averageScore.toFixed(1),
      unit: "/10",
    },
    {
      title: "Watch Time",
      value: Math.round(watchTime),
      unit: "hrs",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {stat.unit}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}