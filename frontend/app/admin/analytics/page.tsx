"use client"
import React, { useState, useEffect } from 'react';
import { fetchAnalyticsSummary, fetchRecentEvents } from '@/lib/analytics';
import StatCard from '@/components/ui/stat-card';
import DataTable from '@/components/ui/data-table';
import { Eye, Globe, Link, Calendar } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const summaryData = await fetchAnalyticsSummary(timeRange);
      const events = await fetchRecentEvents(50);
      
      setSummary(summaryData);
      setRecentEvents(events);
      setLoading(false);
    };
    
    loadData();
  }, [timeRange]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Page Views"
                value={summary?.total_visits || 0}
                icon={<Eye className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="Unique Pages Viewed"
                value={summary?.most_viewed_pages?.length || 0}
                icon={<Link className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="Countries"
                value={summary?.top_countries?.length || 0}
                icon={<Globe className="h-5 w-5 text-primary" />}
              />
              <StatCard
                title="Time Period"
                value={`${timeRange} days`}
                icon={<Calendar className="h-5 w-5 text-primary" />}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Viewed Pages */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Most Viewed Pages</h2>
                <DataTable
                  columns={[
                    { header: 'Page', accessor: 'path' },
                    { header: 'Views', accessor: 'count' },
                  ]}
                  data={summary?.most_viewed_pages || []}
                  emptyMessage="No page views recorded yet"
                />
              </div>

              {/* Top Referrers */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Top Referrers</h2>
                <DataTable
                  columns={[
                    { header: 'Source', accessor: 'referrer' },
                    { header: 'Visits', accessor: 'count' },
                  ]}
                  data={summary?.top_referrers || []}
                  emptyMessage="No referrers recorded yet"
                />
              </div>

              {/* Top Countries */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Top Countries</h2>
                <DataTable
                  columns={[
                    { header: 'Country', accessor: 'country' },
                    { header: 'Visits', accessor: 'count' },
                  ]}
                  data={summary?.top_countries || []}
                  emptyMessage="No country data recorded yet"
                />
              </div>

              {/* Recent Events */}
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
                <DataTable
                  columns={[
                    { header: 'Event', accessor: 'event_type' },
                    { header: 'Page', accessor: 'path' },
                    { 
                      header: 'Time', 
                      accessor: (row) => formatDate(row.timestamp) 
                    },
                  ]}
                  data={recentEvents}
                  emptyMessage="No events recorded yet"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 