"use client"

import * as React from "react"
import { 
  ShoppingCart, Star, Sparkles, Shield, 
  Palette, Flame, Snowflake, Crown, 
  CheckCircle2, Lock, Loader2, Coins 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
// @ts-ignore
import { getShopItems, buyShopItem } from "./actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function TusmaShopPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [category, setCategory] = React.useState<'FRAME' | 'THEME' | 'BADGE'>('FRAME')
  const [buyingId, setBuyingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadShop() {
      const res = await getShopItems()
      if (res.success) {
        setItems(res.items)
      }
      setLoading(false)
    }
    loadShop()
  }, [])

  const handleBuy = async (itemId: string) => {
    if (!user?.studentId) return toast.error("Please verify your account first!")
    
    setBuyingId(itemId)
    try {
      const res = await buyShopItem(user.studentId, itemId)
      if (res.success) {
        toast.success("Purchase successful! Item added to your inventory. 🛍️")
        window.location.reload()
      } else {
        toast.error(res.error || "Failed to buy item")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setBuyingId(null)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-indigo-100 border-t-indigo-600" />
      </div>
    )
  }

  const filteredItems = items.filter(item => item.type === category)
  const userXP = user?.totalXp || 0

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32">
       
       {/* ── Shop Header ── */}
       <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <ShoppingCart className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/90">Premium Gear</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase">Tusma Shop</h1>
                <p className="text-white/60 font-medium text-lg max-w-md">
                   Spend your hard-earned XP to unlock exclusive profile frames, themes, and legendary badges.
                </p>
             </div>

             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl min-w-[220px]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-200 font-bold mb-3">Available Balance</p>
                <div className="flex items-center gap-2">
                   <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                   <span className="text-5xl font-black text-white tracking-tighter">{userXP.toLocaleString()}</span>
                </div>
                <p className="mt-2 text-[10px] font-black uppercase text-white/40 tracking-widest leading-none">Total XP Earned</p>
             </div>
          </div>
       </div>

       {/* ── Tabs ── */}
       <div className="flex justify-center">
          <div className="bg-slate-100 p-2 rounded-[2.5rem] flex gap-2 border-2 border-slate-50 shadow-inner">
             {[
               { id: 'FRAME', icon: Shield, label: 'Frames' },
               { id: 'THEME', icon: Palette, label: 'Themes' },
               { id: 'BADGE', icon: Crown, label: 'Badges' }
             ].map((tab) => (
                <button 
                   key={tab.id}
                   onClick={() => setCategory(tab.id as any)}
                   className={cn(
                      "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                      category === tab.id ? "bg-white text-indigo-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                   )}
                >
                   <tab.icon className="h-4 w-4" />
                   {tab.label}
                </button>
             ))}
          </div>
       </div>

       {/* ── Shop Grid ── */}
       <AnimatePresence mode="wait">
          <motion.div 
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
             {filteredItems.length > 0 ? filteredItems.map((item) => {
                const canAfford = userXP >= item.priceXp
                const isOwned = user?.inventory?.some((owned: any) => owned.itemId === item.id)

                return (
                   <Card key={item.id} className="rounded-[2.5rem] border-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] bg-white overflow-hidden group hover:scale-[1.02] transition-transform">
                      <div className="h-48 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent" />
                         {/* Visual Preview (Mock) */}
                         <div className="relative">
                            {item.type === 'FRAME' && (
                               <div className={cn(
                                 "h-24 w-24 rounded-full border-[6px] relative shadow-2xl",
                                 item.name.toLowerCase().includes('neon') ? "border-indigo-400 shadow-indigo-400/50 animate-pulse" : 
                                 item.name.toLowerCase().includes('fire') ? "border-orange-500 shadow-orange-500/50" : "border-slate-300"
                               )}>
                                 <div className="absolute inset-0 bg-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-400 uppercase">Preview</div>
                               </div>
                            )}
                            {item.type === 'THEME' && <Palette className="h-20 w-20 text-indigo-400 opacity-20" />}
                            {item.type === 'BADGE' && <Crown className="h-20 w-20 text-amber-400" />}
                         </div>
                         <Badge className={cn(
                            "absolute top-4 right-4 font-black uppercase tracking-widest text-[10px] px-3 py-1",
                            item.rarity === 'LEGENDARY' ? "bg-amber-400 text-slate-900" :
                            item.rarity === 'EPIC' ? "bg-purple-600 text-white" :
                            item.rarity === 'RARE' ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                         )}>
                            {item.rarity}
                         </Badge>
                      </div>
                      <CardContent className="p-8 space-y-6">
                         <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-2 uppercase">{item.name}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                         </div>
                         
                         <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
                               <Coins className="h-4 w-4 text-amber-500" />
                               <span className="font-black text-slate-700">{item.priceXp.toLocaleString()}</span>
                            </div>
                            
                            {isOwned ? (
                               <Button disabled className="rounded-2xl h-12 px-6 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  OWNED
                               </Button>
                            ) : (
                               <Button 
                                  onClick={() => handleBuy(item.id)}
                                  disabled={!canAfford || buyingId === item.id}
                                  className={cn(
                                    "rounded-2xl h-12 px-8 font-black transition-all",
                                    canAfford ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/20" : "bg-slate-100 text-slate-400"
                                  )}
                               >
                                  {buyingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (!canAfford ? <Lock className="h-4 w-4 mr-2" /> : "BUY NOW")}
                               </Button>
                            )}
                         </div>
                      </CardContent>
                   </Card>
                )
             }) : (
                <div className="col-span-full py-20 text-center space-y-4">
                   <Sparkles className="h-16 w-16 text-slate-100 mx-auto" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">More legendary items arriving soon</p>
                </div>
             )}
          </motion.div>
       </AnimatePresence>
    </div>
  )
}
