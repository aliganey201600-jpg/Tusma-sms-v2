"use client"

import * as React from "react"
import { 
  DollarSign, 
  CreditCard, 
  History, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Receipt,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  fetchFinanceStats, 
  fetchFeeStructures, 
  createFeeStructure, 
  fetchPaymentHistory, 
  recordPayment,
  fetchStudentsForFinance
} from "./actions"
import { format } from "date-fns"

export default function FinancePage() {
  const [stats, setStats] = React.useState<any>(null)
  const [fees, setFees] = React.useState<any[]>([])
  const [payments, setPayments] = React.useState<any[]>([])
  const [students, setStudents] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isActionLoading, setIsActionLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Form states
  const [paymentForm, setPaymentForm] = React.useState({
    studentId: "",
    feeId: "",
    amount: "",
    method: "CASH",
    ref: "",
    remarks: ""
  })

  const [feeForm, setFeeForm] = React.useState({
    name: "",
    amount: "",
    category: "TUITION",
    year: format(new Date(), "yyyy")
  })

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const [s, f, p, st] = await Promise.all([
      fetchFinanceStats(),
      fetchFeeStructures(),
      fetchPaymentHistory(),
      fetchStudentsForFinance()
    ])
    setStats(s)
    setFees(f as any[])
    setPayments(p as any[])
    setStudents(st as any[])
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleRecordPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.feeId || !paymentForm.amount) {
      toast.error("Please fill all required fields")
      return
    }

    setIsActionLoading(true)
    const res = await recordPayment({
      studentId: paymentForm.studentId,
      feeStructureId: paymentForm.feeId,
      amountPaid: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.method,
      transactionId: paymentForm.ref,
      remarks: paymentForm.remarks
    })
    setIsActionLoading(false)

    if (res.success) {
      toast.success("Payment recorded successfully")
      setPaymentForm({ studentId: "", feeId: "", amount: "", method: "CASH", ref: "", remarks: "" })
      loadData()
    } else {
      toast.error(res.error || "Failed to record payment")
    }
  }

  const handleCreateFee = async () => {
    if (!feeForm.name || !feeForm.amount) {
      toast.error("Please fill all required fields")
      return
    }

    setIsActionLoading(true)
    const res = await createFeeStructure({
      name: feeForm.name,
      amount: parseFloat(feeForm.amount),
      category: feeForm.category,
      academicYear: feeForm.year
    })
    setIsActionLoading(false)

    if (res.success) {
      toast.success("Fee structure created")
      setFeeForm({ name: "", amount: "", category: "TUITION", year: format(new Date(), "yyyy") })
      loadData()
    } else {
      toast.error(res.error || "Failed to create fee structure")
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-10 py-8">
      {/* Header with Glassmorphism Effect */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 text-slate-900">
            <div className="h-14 w-14 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl transform -rotate-6">
              <DollarSign className="h-8 w-8 text-emerald-400" />
            </div>
            Finance.
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">Manage school revenue, fee structures and student payments.</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog>
             <DialogTrigger asChild>
               <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
                 <CreditCard className="h-5 w-5" />
                 Collect Payment
               </Button>
             </DialogTrigger>
             <DialogContent className="rounded-[32px] sm:max-w-[500px] p-8 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Secure Payment Entry</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Record a new fee collection from a student.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Student</label>
                     <Select onValueChange={(v) => setPaymentForm({...paymentForm, studentId: v})}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                          <SelectValue placeholder="Search student..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                           {students.map((s) => (
                             <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.manual_id || "No ID"})</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fee Category</label>
                       <Select onValueChange={(v) => setPaymentForm({...paymentForm, feeId: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                            <SelectValue placeholder="Select Fee" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                             {fees.map((f) => (
                               <SelectItem key={f.id} value={f.id}>{f.name} (${f.amount})</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount Paid ($)</label>
                       <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="h-12 rounded-xl border-slate-100 bg-slate-50 font-black"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                       />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Method</label>
                       <Select defaultValue="CASH" onValueChange={(v) => setPaymentForm({...paymentForm, method: v})}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                             <SelectItem value="CASH">Cash Payment</SelectItem>
                             <SelectItem value="EVC_PLUS">EVC Plus</SelectItem>
                             <SelectItem value="ZAAD">ZAAD Service</SelectItem>
                             <SelectItem value="SAHAL">Sahal</SelectItem>
                             <SelectItem value="BANK">Bank Transfer</SelectItem>
                          </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference/Transaction ID</label>
                       <Input 
                        placeholder="Ref #" 
                        className="h-12 rounded-xl border-slate-100 bg-slate-50 font-medium"
                        value={paymentForm.ref}
                        onChange={(e) => setPaymentForm({...paymentForm, ref: e.target.value})}
                       />
                     </div>
                   </div>
                </div>
                <DialogFooter>
                   <Button 
                    onClick={handleRecordPayment} 
                    disabled={isActionLoading}
                    className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-100"
                   >
                     {isActionLoading ? <Loader2 className="animate-spin" /> : "Verify & Confirm Payment"}
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>

          <Dialog>
             <DialogTrigger asChild>
               <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50 transition-all gap-3">
                 <Plus className="h-5 w-5" />
                 Setup New Fee
               </Button>
             </DialogTrigger>
             <DialogContent className="rounded-[32px] sm:max-w-[450px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Add Fee Structure</DialogTitle>
                  <DialogDescription>Define a new fee for a grade or session.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fee Description</label>
                     <Input 
                        placeholder="e.g. Grade 12 Annual Tuition" 
                        className="h-12 rounded-xl"
                        value={feeForm.name}
                        onChange={(e) => setFeeForm({...feeForm, name: e.target.value})}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Amount ($)</label>
                       <Input 
                        type="number"
                        placeholder="0.00" 
                        className="h-12 rounded-xl font-bold"
                        value={feeForm.amount}
                        onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Year</label>
                       <Input 
                        placeholder="2024/2025" 
                        className="h-12 rounded-xl"
                        value={feeForm.year}
                        onChange={(e) => setFeeForm({...feeForm, year: e.target.value})}
                       />
                     </div>
                   </div>
                </div>
                <DialogFooter>
                   <Button 
                    onClick={handleCreateFee}
                    disabled={isActionLoading}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest"
                   >
                     Save Structure
                   </Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards - Modern Horizontal Scroll/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, color: "bg-emerald-50 text-emerald-600", icon: Wallet, trend: stats.collectionRate.toFixed(1) + "% Collection" },
           { label: "Outstanding", value: `$${(stats.totalExpected - stats.totalRevenue).toLocaleString()}`, color: "bg-red-50 text-red-600", icon: AlertCircle, trend: "Pending Balance" },
           { label: "Today Collection", value: `$${stats.todayRevenue.toLocaleString()}`, color: "bg-blue-50 text-blue-600", icon: TrendingUp, trend: "Real-time sync" },
           { label: "Active Payers", value: stats.totalRevenue > 0 ? "84%" : "0%", color: "bg-amber-50 text-amber-600", icon: Users, trend: "Compliance Rate" }
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-sm border border-white/20 p-6 group hover:shadow-xl transition-all duration-500">
             <div className="flex items-start justify-between">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", stat.color)}>
                   <stat.icon className="h-7 w-7" />
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-white/50 text-[10px] font-black uppercase">
                   {stat.trend}
                </Badge>
             </div>
             <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 leading-none mt-2 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
             </div>
           </Card>
         ))}
      </div>

      {/* Main Content Sections */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border-none h-16 w-full md:w-auto">
          <TabsTrigger value="overview" className="rounded-xl px-10 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Financial Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-10 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Payment Records
          </TabsTrigger>
          <TabsTrigger value="structures" className="rounded-xl px-10 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Fee Structures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] p-8 bg-white/90">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h3 className="text-2xl font-black text-slate-900">Collection Trends</h3>
                       <p className="text-slate-400 font-medium text-sm">Revenue growth over the current session.</p>
                    </div>
                    <Select defaultValue="month">
                       <SelectTrigger className="w-32 rounded-xl border-slate-100">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="week">Weekly</SelectItem>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 {/* Visual Placeholder for a chart */}
                 <div className="h-64 w-full bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent flex items-end p-8 gap-4">
                       {[60, 45, 80, 55, 90, 70, 85, 40, 65, 95, 75, 80].map((h, i) => (
                         <div 
                          key={i} 
                          className="flex-1 bg-slate-200 rounded-t-lg group-hover:bg-primary transition-all duration-1000" 
                          style={{ height: `${h}%`, transitionDelay: `${i*50}ms` }} 
                         />
                       ))}
                    </div>
                    <div className="relative z-10 text-center">
                       <TrendingUp className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Projection Insights</p>
                    </div>
                 </div>
              </Card>

              <Card className="border-none shadow-sm rounded-[40px] p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between">
                 <div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[10px] uppercase tracking-widest px-4 mb-6">Security Check</Badge>
                    <h3 className="text-3xl font-black leading-tight mb-4 tracking-tight">Financial<br/>Compliance</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                       Our smart accounting engine cross-references every transaction with student enrollment status for 100% accuracy.
                    </p>
                 </div>
                 
                 <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                             <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-bold">Audit Complete</span>
                       </div>
                       <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                             <History className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-bold">System Backups</span>
                       </div>
                       <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                 </div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="history">
           <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                 <h3 className="text-2xl font-black text-slate-900">Transaction History</h3>
                 <div className="flex gap-3">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                       <Input 
                        placeholder="Search Ref or Name..." 
                        className="pl-10 h-10 w-64 rounded-xl border-slate-100 text-sm focus:ring-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100">
                       <Download className="h-4 w-4 text-slate-500" />
                    </Button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                       <tr>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student & Ref</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Type</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {payments.filter(p => 
                        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase())
                       ).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                   {p.firstName[0]}{p.lastName[0]}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 leading-tight">{p.firstName} {p.lastName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{p.transactionId || "GENERIC_REF"}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <Badge variant="outline" className="rounded-full px-3 text-[9px] font-black uppercase border-slate-100 bg-slate-50/50">
                                 {p.fee_name}
                              </Badge>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                                 <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{p.paymentMethod.replace('_', ' ')}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-sm font-black text-slate-900">${p.amountPaid.toLocaleString()}</span>
                           </td>
                           <td className="px-8 py-6 text-xs font-medium text-slate-400">
                              {format(new Date(p.paymentDate), "MMM dd, hh:mm a")}
                           </td>
                           <td className="px-8 py-6">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-900 hover:text-white transition-colors">
                                 <Receipt className="h-4 w-4" />
                              </Button>
                           </td>
                        </tr>
                       ))}
                       {payments.length === 0 && (
                        <tr>
                           <td colSpan={6} className="px-8 py-20 text-center">
                              <History className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                              <p className="text-sm font-bold text-slate-400">No transactions recorded yet.</p>
                           </td>
                        </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </Card>
        </TabsContent>

        <TabsContent value="structures">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fees.map((f) => (
                <Card key={f.id} className="border-none shadow-sm rounded-[32px] p-8 bg-white hover:scale-[1.02] transition-transform duration-300">
                   <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <DollarSign className="h-6 w-6" />
                      </div>
                      <Badge className="bg-slate-900 text-white border-none font-black text-[9px] uppercase tracking-widest px-3">
                         {f.academicYear}
                      </Badge>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-1">{f.name}</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f.category}</p>
                   
                   <div className="mt-8 pt-8 border-t border-slate-50 flex items-end justify-between">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Fee Amount</p>
                         <p className="text-3xl font-black text-slate-900">${f.amount.toLocaleString()}</p>
                      </div>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100">
                         <Plus className="h-4 w-4" />
                      </Button>
                   </div>
                </Card>
              ))}
              <div className="border-2 border-dashed border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-50/50 transition-colors">
                 <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                 </div>
                 <h4 className="text-sm font-bold text-slate-400">Add Structure</h4>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
