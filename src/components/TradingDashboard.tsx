import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, BarChart3 } from "lucide-react";

interface MarketData {
  symbol: string;
  contractExpiry: string;
  currentPrice: number;
  vwap: number;
  atr: number;
  rsi: number;
  volumeTrend: string;
}

interface UserSettings {
  cashAvailable: number;
  targetPnL: number;
  maxLeverage: number;
  contractSize: number;
  riskPreference: string;
  marginConstraint: number;
}

interface TradeGrid {
  strategy: string;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  contracts: number;
  maxProfit: number;
  maxLoss: number;
  marginRequired: number;
  leverage: number;
  notionalValue: number;
}

const TradingDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    symbol: 'BTC',
    contractExpiry: '25 JUL',
    currentPrice: 45000,
    vwap: 44950,
    atr: 1200,
    rsi: 55,
    volumeTrend: 'increasing'
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    cashAvailable: 100000,
    targetPnL: 300,
    maxLeverage: 6,
    contractSize: 1,
    riskPreference: 'balanced',
    marginConstraint: 20
  });

  const [tradeGrids, setTradeGrids] = useState<TradeGrid[]>([]);

  const calculateTradeGrids = () => {
    const { currentPrice, vwap, atr } = marketData;
    const { targetPnL, maxLeverage, contractSize, marginConstraint, cashAvailable } = userSettings;

    // Calculate entry zones using VWAP ± ATR methodology
    const atrMultiplier = 0.175; // 0.15-0.2 range as specified
    const entryLong = vwap - (atrMultiplier * atr);
    const entryShort = vwap + (atrMultiplier * atr);

    // Calculate TP/SL levels based on target profit
    const calculateContracts = (entry: number, tp: number): number => {
      const priceMove = Math.abs(tp - entry);
      return Math.ceil(targetPnL / (priceMove * contractSize));
    };

    // Long position calculation
    const longTP = entryLong + (targetPnL / (10 * contractSize)); // Simplified calculation
    const longSL = entryLong - (atr * 0.4); // Risk-based SL
    const longContracts = calculateContracts(entryLong, longTP);
    const longNotional = entryLong * longContracts * contractSize;
    const longLeverage = Math.min(longNotional / (cashAvailable * (marginConstraint / 100)), maxLeverage);
    const longMargin = longNotional / longLeverage;

    // Short position calculation
    const shortTP = entryShort - (targetPnL / (10 * contractSize));
    const shortSL = entryShort + (atr * 0.4);
    const shortContracts = calculateContracts(entryShort, shortTP);
    const shortNotional = entryShort * shortContracts * contractSize;
    const shortLeverage = Math.min(shortNotional / (cashAvailable * (marginConstraint / 100)), maxLeverage);
    const shortMargin = shortNotional / shortLeverage;

    const newGrids: TradeGrid[] = [
      {
        strategy: 'C1-L',
        entryPrice: entryLong,
        takeProfit: longTP,
        stopLoss: longSL,
        contracts: longContracts,
        maxProfit: targetPnL,
        maxLoss: (entryLong - longSL) * longContracts * contractSize,
        marginRequired: longMargin,
        leverage: longLeverage,
        notionalValue: longNotional
      },
      {
        strategy: 'C1-S',
        entryPrice: entryShort,
        takeProfit: shortTP,
        stopLoss: shortSL,
        contracts: shortContracts,
        maxProfit: targetPnL,
        maxLoss: (shortSL - entryShort) * shortContracts * contractSize,
        marginRequired: shortMargin,
        leverage: shortLeverage,
        notionalValue: shortNotional
      }
    ];

    setTradeGrids(newGrids);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Crypto Futures Grid Trading System
          </h1>
          <p className="text-muted-foreground text-lg">
            Systematic grid-based trading with VWAP, ATR, and profit optimization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Data Input */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Market Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={marketData.symbol} onValueChange={(value) => 
                    setMarketData(prev => ({ ...prev, symbol: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="XRP">XRP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiry">Contract Expiry</Label>
                  <Input
                    id="expiry"
                    value={marketData.contractExpiry}
                    onChange={(e) => setMarketData(prev => ({ ...prev, contractExpiry: e.target.value }))}
                    placeholder="25 JUL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Current Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={marketData.currentPrice}
                    onChange={(e) => setMarketData(prev => ({ ...prev, currentPrice: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vwap">VWAP ($)</Label>
                  <Input
                    id="vwap"
                    type="number"
                    value={marketData.vwap}
                    onChange={(e) => setMarketData(prev => ({ ...prev, vwap: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="atr">ATR ($)</Label>
                  <Input
                    id="atr"
                    type="number"
                    value={marketData.atr}
                    onChange={(e) => setMarketData(prev => ({ ...prev, atr: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rsi">RSI</Label>
                  <Input
                    id="rsi"
                    type="number"
                    value={marketData.rsi}
                    onChange={(e) => setMarketData(prev => ({ ...prev, rsi: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="volume">Volume Trend</Label>
                <Select value={marketData.volumeTrend} onValueChange={(value) => 
                  setMarketData(prev => ({ ...prev, volumeTrend: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increasing">Increasing</SelectItem>
                    <SelectItem value="decreasing">Decreasing</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* User Settings */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Trading Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cash">Cash Available ($)</Label>
                  <Input
                    id="cash"
                    type="number"
                    value={userSettings.cashAvailable}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, cashAvailable: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target PnL ($)</Label>
                  <Input
                    id="target"
                    type="number"
                    value={userSettings.targetPnL}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, targetPnL: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leverage">Max Leverage</Label>
                  <Input
                    id="leverage"
                    type="number"
                    value={userSettings.maxLeverage}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, maxLeverage: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contract">Contract Size</Label>
                  <Input
                    id="contract"
                    type="number"
                    value={userSettings.contractSize}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, contractSize: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk">Risk Preference</Label>
                  <Select value={userSettings.riskPreference} onValueChange={(value) => 
                    setUserSettings(prev => ({ ...prev, riskPreference: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="margin">Margin Constraint (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={userSettings.marginConstraint}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, marginConstraint: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <Button 
                onClick={calculateTradeGrids} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Trade Grid
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        {tradeGrids.length > 0 && (
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Trade Grid Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Strategy</th>
                      <th className="text-left p-3 font-medium">Entry ($)</th>
                      <th className="text-left p-3 font-medium">TP ($)</th>
                      <th className="text-left p-3 font-medium">SL ($)</th>
                      <th className="text-left p-3 font-medium">Contracts</th>
                      <th className="text-left p-3 font-medium">Max Profit</th>
                      <th className="text-left p-3 font-medium">Max Loss</th>
                      <th className="text-left p-3 font-medium">Margin</th>
                      <th className="text-left p-3 font-medium">Leverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeGrids.map((grid, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">
                          <Badge variant={grid.strategy.includes('L') ? 'default' : 'destructive'}>
                            {grid.strategy.includes('L') ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            )}
                            {grid.strategy}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono">{grid.entryPrice.toFixed(2)}</td>
                        <td className="p-3 font-mono text-trading-long">{grid.takeProfit.toFixed(2)}</td>
                        <td className="p-3 font-mono text-trading-short">{grid.stopLoss.toFixed(2)}</td>
                        <td className="p-3">{grid.contracts}</td>
                        <td className="p-3 text-trading-long font-medium">${grid.maxProfit.toFixed(0)}</td>
                        <td className="p-3 text-trading-short font-medium">-${grid.maxLoss.toFixed(0)}</td>
                        <td className="p-3">${grid.marginRequired.toFixed(0)}</td>
                        <td className="p-3">{grid.leverage.toFixed(1)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total Margin Required</div>
                    <div className="text-2xl font-bold">
                      ${tradeGrids.reduce((sum, grid) => sum + grid.marginRequired, 0).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Potential Profit</div>
                    <div className="text-2xl font-bold text-trading-long">
                      ${tradeGrids.reduce((sum, grid) => sum + grid.maxProfit, 0).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total Risk</div>
                    <div className="text-2xl font-bold text-trading-short">
                      -${tradeGrids.reduce((sum, grid) => sum + grid.maxLoss, 0).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TradingDashboard;