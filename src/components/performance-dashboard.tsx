/**
 * Performance Dashboard Component
 * Real-time performance monitoring and metrics display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  PerformanceMonitor,
  UXScore,
  PerformanceBudget,
  MemoryMonitor,
  NetworkMonitor,
  LoadingAnalytics
} from '../lib/performance-monitoring';
import { Activity, Cpu, HardDrive, Wifi, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  uxScore: number;
  rating: string;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null;
  budget: {
    exceeded: string[];
    withinBudget: string[];
  };
  milestones: Record<string, number>;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateMetrics = () => {
      const coreWebVitals = PerformanceMonitor.getMetrics();
      const uxScore = UXScore.calculateUXScore();
      const rating = UXScore.getUXRating();
      const memory = MemoryMonitor.getMemoryUsage();
      const network = NetworkMonitor.getConnectionInfo();
      const budget = PerformanceBudget.checkBudget();
      const milestones = LoadingAnalytics.getMilestones();

      setMetrics({
        coreWebVitals,
        uxScore,
        rating,
        memory,
        network,
        budget,
        milestones,
      });
      setLastUpdate(new Date());
    };

    // Initial update
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  if (!metrics) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 z-50">
        <CardContent className="p-4">
          <div className="animate-pulse">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      needs_improvement: 'outline',
      poor: 'destructive',
    } as const;

    return (
      <Badge variant={variants[rating as keyof typeof variants] || 'outline'}>
        {rating.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Performance Dashboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">UX Score</span>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getScoreColor(metrics.uxScore)}`}>
                  {metrics.uxScore.toFixed(1)}
                </span>
                {getRatingBadge(metrics.rating)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Core Web Vitals</span>
                <span className={getScoreColor(UXScore.getScores()['core_web_vitals'])}>
                  {UXScore.getScores()['core_web_vitals'].toFixed(1)}
                </span>
              </div>
              <Progress value={UXScore.getScores()['core_web_vitals']} className="h-2" />
            </div>

            {metrics.memory && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <HardDrive className="w-4 h-4 mr-1" />
                  Memory
                </div>
                <span>
                  {(metrics.memory.used / 1024 / 1024).toFixed(1)}MB /
                  {(metrics.memory.limit / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            )}

            {metrics.network && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Wifi className="w-4 h-4 mr-1" />
                  Network
                </div>
                <span>{metrics.network.effectiveType} ({metrics.network.downlink}Mbps)</span>
              </div>
            )}

            {metrics.budget.exceeded.length > 0 && (
              <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Budget exceeded ({metrics.budget.exceeded.length})
              </div>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">LCP</div>
                <div className="text-lg font-bold">{metrics.coreWebVitals.lcp.toFixed(0)}ms</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">FID</div>
                <div className="text-lg font-bold">{metrics.coreWebVitals.fid.toFixed(0)}ms</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">CLS</div>
                <div className="text-lg font-bold">{metrics.coreWebVitals.cls.toFixed(3)}</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">FCP</div>
                <div className="text-lg font-bold">{metrics.coreWebVitals.fcp.toFixed(0)}ms</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Loading Milestones</h4>
              {Object.entries(metrics.milestones).map(([name, time]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span>{name.replace('_', ' ')}</span>
                  <span>{time.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Performance Budget</h4>

              {metrics.budget.withinBudget.map((item) => (
                <div key={item} className="flex justify-between text-sm text-green-600">
                  <span>{item.split(':')[0]}</span>
                  <span>{item.split(':')[1]}</span>
                </div>
              ))}

              {metrics.budget.exceeded.map((item) => (
                <div key={item} className="flex justify-between text-sm text-red-600">
                  <span>{item.split(':')[0]}</span>
                  <span>{item.split(':')[1]}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => MemoryMonitor.forceGarbageCollection()}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Force GC
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}