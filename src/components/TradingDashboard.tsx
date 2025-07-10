import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Send, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface RecommendationResult {
  coin: string;
  strategy: string;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  contracts: number;
  max_profit: number;
  max_loss: number;
  margin_required: number;
  confidence: string;
  reason: string;
}

const TradingDashboard = () => {
  const { toast } = useToast();
  const [coinData, setCoinData] = useState("");
  const [customPrompt, setCustomPrompt] = useState(
    "Recommend the best trade among these coins, taking into account current volume vs last 12h, open interest, expiry, contract size, and recent price trends. Target profit: $500."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof RecommendationResult | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSubmit = async () => {
    if (!coinData.trim()) {
      toast({
        title: "Error",
        description: "Please paste coin data before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin_data: coinData,
          prompt: customPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setResults(data.recommendations || []);
      toast({
        title: "Success",
        description: "Trade recommendations generated successfully.",
      });
    } catch (error) {
      // Mock data for demonstration since API endpoint doesn't exist
      const mockResults: RecommendationResult[] = [
        {
          coin: "BTC",
          strategy: "C1-L",
          entry_price: 67000,
          target_price: 68500,
          stop_loss: 65500,
          contracts: 5,
          max_profit: 7500,
          max_loss: 7500,
          margin_required: 67000,
          confidence: "High",
          reason: "Strong volume increase, above VWAP"
        },
        {
          coin: "ETH",
          strategy: "C1-S",
          entry_price: 3450,
          target_price: 3300,
          stop_loss: 3600,
          contracts: 15,
          max_profit: 2250,
          max_loss: 2250,
          margin_required: 10350,
          confidence: "Medium",
          reason: "Resistance at current level"
        }
      ];
      setResults(mockResults);
      toast({
        title: "Demo Mode",
        description: "Showing mock data since API endpoint is not available.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof RecommendationResult) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });

  const exportToExcel = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No recommendations to export.",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trade Recommendations");
    
    const fileName = `trade_recommendations_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Export Complete",
      description: `Downloaded ${fileName}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Crypto Futures Trading Recommendations
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered trading analysis for optimal futures strategies
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            {/* Coin Data Input */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Coin Data Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coinData">Paste coin metrics here</Label>
                  <Textarea
                    id="coinData"
                    placeholder="Paste coin metrics here (e.g. Last Price, Open Interest, Vol, Expiry…)"
                    value={coinData}
                    onChange={(e) => setCoinData(e.target.value)}
                    className="min-h-[200px] bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom Prompt</Label>
                  <Input
                    id="customPrompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={exportToExcel}
                    disabled={results.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Trade Recommendations
                  {results.length > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {results.length} trades
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Submit coin data to see trading recommendations</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('coin')}
                          >
                            Coin {sortColumn === 'coin' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('strategy')}
                          >
                            Strategy {sortColumn === 'strategy' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('entry_price')}
                          >
                            Entry {sortColumn === 'entry_price' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('max_profit')}
                          >
                            Max Profit {sortColumn === 'max_profit' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('confidence')}
                          >
                            Confidence {sortColumn === 'confidence' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedResults.map((result, index) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{result.coin}</TableCell>
                            <TableCell>
                              <Badge variant={result.strategy.includes('L') ? "default" : "secondary"}>
                                {result.strategy}
                              </Badge>
                            </TableCell>
                            <TableCell>${result.entry_price.toLocaleString()}</TableCell>
                            <TableCell className="text-green-500 font-medium">
                              {formatCurrency(result.max_profit)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  result.confidence === 'High' ? 'default' : 
                                  result.confidence === 'Medium' ? 'secondary' : 
                                  'outline'
                                }
                              >
                                {result.confidence}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Detailed View */}
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Trade Details</h4>
                      {sortedResults.map((result, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/30 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{result.coin} - {result.strategy}</span>
                            <Badge variant="outline">{result.confidence}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Entry: </span>
                              <span className="font-medium">${result.entry_price.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target: </span>
                              <span className="font-medium text-green-500">${result.target_price.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stop Loss: </span>
                              <span className="font-medium text-red-500">${result.stop_loss.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contracts: </span>
                              <span className="font-medium">{result.contracts}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{result.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;