import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from './button';
import { X, ShoppingCart, Coins } from 'lucide-react';
import type { NPC, Item } from '@/types/game';

interface ShopUIProps {
  npc: NPC;
  onClose: () => void;
}

export default function ShopUI({ npc, onClose }: ShopUIProps) {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  if (!npc.shop) return null;

  const handleBuy = (itemId: string) => {
    dispatch({ type: 'BUY_ITEM', itemId, npcId: npc.id });
  };

  const handleSell = (itemId: string) => {
    dispatch({ type: 'SELL_ITEM', itemId, npcId: npc.id });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border-2 border-primary rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-primary font-mono">{npc.name}'s Shop</h2>
            <p className="text-sm text-muted-foreground font-mono flex items-center gap-2 mt-1">
              <Coins className="w-4 h-4" />
              Your Gold: {state.player.gold}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === 'buy' ? 'default' : 'outline'}
            onClick={() => setTab('buy')}
            className="flex-1 font-mono"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy
          </Button>
          <Button
            variant={tab === 'sell' ? 'default' : 'outline'}
            onClick={() => setTab('sell')}
            className="flex-1 font-mono"
          >
            <Coins className="w-4 h-4 mr-2" />
            Sell
          </Button>
        </div>

        {/* Buy Tab */}
        {tab === 'buy' && (
          <div className="space-y-2">
            {npc.shop.map((shopItem, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{shopItem.item.sprite}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground font-mono">
                        {shopItem.item.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {shopItem.item.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-500 font-mono flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {shopItem.buyPrice}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuy(shopItem.item.id)}
                    disabled={state.player.gold < shopItem.buyPrice}
                    className="font-mono"
                  >
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sell Tab */}
        {tab === 'sell' && (
          <div className="space-y-2">
            {state.player.inventory.length === 0 ? (
              <p className="text-center text-muted-foreground font-mono py-8">
                Your inventory is empty
              </p>
            ) : (
              state.player.inventory.map((item: Item) => {
                const shopItem = npc.shop?.find(si => si.item.name === item.name);
                const sellPrice = shopItem?.sellPrice || 0;
                const canSell = !!shopItem;

                return (
                  <div
                    key={item.id}
                    className="bg-background border border-border rounded p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.sprite}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground font-mono">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {canSell ? (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-bold text-yellow-500 font-mono flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {sellPrice}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSell(item.id)}
                            className="font-mono"
                          >
                            Sell
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground font-mono">
                          Can't sell
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
