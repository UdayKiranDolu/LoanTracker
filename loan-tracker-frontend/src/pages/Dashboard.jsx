// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
// import { 
//   DollarSign, 
//   TrendingUp,
//   FileText, 
//   AlertCircle,
//   AlertTriangle,
//   CheckCircle,
//   Plus,
//   RefreshCw,
//   Calendar,
//   Clock,
//   Activity,
//   ChevronRight,
//   BarChart3,
//   Menu,
//   X
// } from 'lucide-react';
// import toast from 'react-hot-toast';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalLoans: 0,
//     activeLoans: 0,
//     totalLoanAmount: 0,
//     totalInterest: 0,
//     dueSoonCount: 0,
//     overdueCount: 0,
//     completedLoans: 0
//   });
//   const [recentLoans, setRecentLoans] = useState([]);
//   const [dueSoonLoans, setDueSoonLoans] = useState([]);
//   const [overdueLoans, setOverdueLoans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [mobileAlertsOpen, setMobileAlertsOpen] = useState(false);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [statsRes, loansRes, dueSoonRes, overdueRes] = await Promise.all([
//         api.get('/loans/statistics'),
//         api.get('/loans?page=1&limit=5&sortBy=createdAt&sortOrder=desc'),
//         api.get('/loans/status/duesoon'),
//         api.get('/loans/status/overdue')
//       ]);

//       console.log('Stats Response:', statsRes);

//       if (statsRes?.success) {
//         const statsData = statsRes.data || statsRes;
        
//         setStats({
//           totalLoans: statsData.totalLoans || statsData.total || 0,
//           activeLoans: statsData.activeLoans || statsData.active || 0,
//           totalLoanAmount: statsData.totalLoanAmount || statsData.totalAmount || 0,
//           totalInterest: statsData.totalInterest || statsData.interest || 0,
//           dueSoonCount: statsData.dueSoonCount || statsData.dueSoon || 0,
//           overdueCount: statsData.overdueCount || statsData.overdue || 0,
//           completedLoans: statsData.completedLoans || statsData.completed || 0
//         });
//       }

//       if (loansRes?.success) {
//         const loans = Array.isArray(loansRes.data) 
//           ? loansRes.data 
//           : loansRes.data?.loans || [];
//         setRecentLoans(loans);
//       }

//       if (dueSoonRes?.success) {
//         const dueSoon = Array.isArray(dueSoonRes.data) 
//           ? dueSoonRes.data 
//           : [];
//         setDueSoonLoans(dueSoon);
//       }

//       if (overdueRes?.success) {
//         const overdue = Array.isArray(overdueRes.data) 
//           ? overdueRes.data 
//           : [];
//         setOverdueLoans(overdue);
//       }

//     } catch (err) {
//       console.error('Dashboard error:', err);
//       setError(err.response?.data?.message || 'Failed to load dashboard data');
      
//       try {
//         const loansRes = await api.get('/loans?page=1&limit=100');
//         if (loansRes?.success) {
//           const allLoans = Array.isArray(loansRes.data) 
//             ? loansRes.data 
//             : loansRes.data?.loans || [];
          
//           calculateStatsFromLoans(allLoans);
//         }
//       } catch (fallbackErr) {
//         console.error('Fallback calculation failed:', fallbackErr);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStatsFromLoans = (loans) => {
//     const now = new Date();
//     const stats = {
//       totalLoans: loans.length,
//       activeLoans: 0,
//       totalLoanAmount: 0,
//       totalInterest: 0,
//       dueSoonCount: 0,
//       overdueCount: 0,
//       completedLoans: 0
//     };

//     loans.forEach(loan => {
//       if (loan.status === 'active') stats.activeLoans++;
//       else if (loan.status === 'completed') stats.completedLoans++;

//       stats.totalLoanAmount += loan.loanAmount || 0;
//       stats.totalInterest += loan.interestAmount || 0;

//       if (loan.dueDate && loan.status === 'active') {
//         const dueDate = new Date(loan.dueDate);
//         const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
//         if (diffDays < 0) {
//           stats.overdueCount++;
//         } else if (diffDays <= 7) {
//           stats.dueSoonCount++;
//         }
//       }
//     });

//     setStats(stats);
    
//     const recent = loans.slice(0, 5);
//     setRecentLoans(recent);
    
//     const dueSoon = loans.filter(loan => {
//       if (loan.status !== 'active' || !loan.dueDate) return false;
//       const dueDate = new Date(loan.dueDate);
//       const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
//       return diffDays >= 0 && diffDays <= 7;
//     });
//     setDueSoonLoans(dueSoon);
    
//     const overdue = loans.filter(loan => {
//       if (loan.status !== 'active' || !loan.dueDate) return false;
//       const dueDate = new Date(loan.dueDate);
//       const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
//       return diffDays < 0;
//     });
//     setOverdueLoans(overdue);
//   };

//   const formatCurrency = (amount) => {
//     const value = Number(amount) || 0;
//     // Shorten large numbers on mobile
//     if (window.innerWidth < 640 && value >= 1000000) {
//       return `$${(value / 1000000).toFixed(1)}M`;
//     }
//     if (window.innerWidth < 640 && value >= 1000) {
//       return `$${(value / 1000).toFixed(0)}K`;
//     }
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(value);
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     const d = new Date(date);
//     // Shorter format on mobile
//     if (window.innerWidth < 640) {
//       return `${(d.getMonth() + 1)}/${d.getDate()}`;
//     }
//     return d.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const getDaysLeft = (date) => {
//     if (!date) return null;
//     const now = new Date();
//     const target = new Date(date);
//     const diffTime = target - now;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   const getRelativeTimeDisplay = (date) => {
//     const days = getDaysLeft(date);
    
//     if (days === null) return { text: 'No due date', color: 'text-gray-500' };
//     if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-red-600' };
//     if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
//     if (days === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
//     if (days <= 7) return { text: `${days}d left`, color: 'text-yellow-600' };
//     return { text: `${days}d left`, color: 'text-green-600' };
//   };

//   const getStatusStyles = (status) => {
//     const styles = {
//       active: {
//         bg: 'bg-green-100',
//         text: 'text-green-800',
//         icon: CheckCircle,
//         iconColor: 'text-green-500'
//       },
//       dueSoon: {
//         bg: 'bg-yellow-100',
//         text: 'text-yellow-800',
//         icon: Clock,
//         iconColor: 'text-yellow-500'
//       },
//       overdue: {
//         bg: 'bg-red-100',
//         text: 'text-red-800',
//         icon: AlertTriangle,
//         iconColor: 'text-red-500'
//       },
//       completed: {
//         bg: 'bg-blue-100',
//         text: 'text-blue-800',
//         icon: CheckCircle,
//         iconColor: 'text-blue-500'
//       }
//     };
//     return styles[status] || styles.active;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center">
//           <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
//           <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
//       {/* Header - Responsive */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
//         <div className="w-full sm:w-auto">
//           <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
//             Welcome back{window.innerWidth > 640 && `, ${user?.name?.split(' ')[0] || 'Admin'}`}! 👋
//           </h1>
//           <p className="text-sm sm:text-base text-gray-600 mt-1">
//             {window.innerWidth > 640 
//               ? "Here's what's happening with your loans today."
//               : "Your loan overview"}
//           </p>
//         </div>
//         <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
//           <button
//             onClick={loadDashboardData}
//             className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
//           >
//             <RefreshCw className="w-4 h-4" />
//             <span className="hidden xs:inline">Refresh</span>
//           </button>
//           <Link
//             to="/loans/new"
//             className="flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm sm:text-base"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add Loan</span>
//           </Link>
//         </div>
//       </div>

//       {/* Error Alert - Responsive */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg">
//           <div className="flex items-start sm:items-center">
//             <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
//             <p className="text-xs sm:text-sm text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {/* Stats Grid - Responsive */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
//         {/* Total Loans */}
//         <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div className="order-2 sm:order-1">
//               <p className="text-xs sm:text-sm font-medium text-gray-500">Total Loans</p>
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
//                 {stats.totalLoans}
//               </p>
//               <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
//                 {stats.activeLoans} active
//               </p>
//             </div>
//             <div className="order-1 sm:order-2 p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl w-fit">
//               <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         {/* Total Amount */}
//         <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div className="order-2 sm:order-1">
//               <p className="text-xs sm:text-sm font-medium text-gray-500">Total Amount</p>
//               <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 break-all">
//                 {formatCurrency(stats.totalLoanAmount)}
//               </p>
//               <p className="hidden sm:flex text-xs sm:text-sm text-green-600 mt-0.5 sm:mt-1 items-center gap-1">
//                 <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
//                 <span className="hidden lg:inline">Outstanding</span>
//               </p>
//             </div>
//             <div className="order-1 sm:order-2 p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl w-fit">
//               <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600" />
//             </div>
//           </div>
//         </div>

//         {/* Total Interest */}
//         <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div className="order-2 sm:order-1">
//               <p className="text-xs sm:text-sm font-medium text-gray-500">Total Interest</p>
//               <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 break-all">
//                 {formatCurrency(stats.totalInterest)}
//               </p>
//               <p className="hidden sm:flex text-xs sm:text-sm text-purple-600 mt-0.5 sm:mt-1 items-center gap-1">
//                 <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
//                 <span className="hidden lg:inline">Expected</span>
//               </p>
//             </div>
//             <div className="order-1 sm:order-2 p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl w-fit">
//               <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         {/* Alerts */}
//         <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div className="order-2 sm:order-1">
//               <p className="text-xs sm:text-sm font-medium text-gray-500">Attention</p>
//               <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
//                 {stats.dueSoonCount + stats.overdueCount}
//               </p>
//               <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
//                 <span className="text-xs sm:text-sm text-yellow-600">
//                   {stats.dueSoonCount} soon
//                 </span>
//                 <span className="text-xs sm:text-sm text-red-600">
//                   {stats.overdueCount} late
//                 </span>
//               </div>
//             </div>
//             <div className="order-1 sm:order-2 p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl w-fit">
//               <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-orange-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Alerts Toggle Button */}
//       <div className="lg:hidden">
//         <button
//           onClick={() => setMobileAlertsOpen(!mobileAlertsOpen)}
//           className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
//         >
//           <div className="flex items-center gap-2">
//             <AlertCircle className="w-5 h-5 text-orange-500" />
//             <span className="font-medium">View Alerts</span>
//             <span className="text-sm text-gray-500">
//               ({stats.dueSoonCount + stats.overdueCount})
//             </span>
//           </div>
//           {mobileAlertsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//         </button>
//       </div>

//       {/* Mobile Alerts Content */}
//       {mobileAlertsOpen && (
//         <div className="lg:hidden space-y-4 animate-fadeIn">
//           {/* Due Soon */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-100 bg-yellow-50">
//               <div className="flex items-center gap-2">
//                 <Clock className="w-4 h-4 text-yellow-600" />
//                 <h3 className="font-semibold text-yellow-800 text-sm">Due Soon</h3>
//                 <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
//                   {dueSoonLoans.length}
//                 </span>
//               </div>
//             </div>
//             {dueSoonLoans.length > 0 ? (
//               <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
//                 {dueSoonLoans.slice(0, 3).map((loan) => {
//                   const daysLeft = getDaysLeft(loan.dueDate);
//                   return (
//                     <Link
//                       key={loan._id}
//                       to={`/loans/${loan._id}`}
//                       className="block p-3 hover:bg-yellow-50 transition-colors"
//                     >
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 text-sm truncate">
//                             {loan.borrowerName}
//                           </p>
//                           <p className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
//                             <Calendar className="w-3 h-3" />
//                             {daysLeft === 0 ? 'Due today' : 
//                              daysLeft === 1 ? 'Tomorrow' :
//                              `${daysLeft}d left`}
//                           </p>
//                         </div>
//                         <p className="font-semibold text-gray-900 text-sm ml-2">
//                           {formatCurrency(loan.loanAmount)}
//                         </p>
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="p-4 text-center text-gray-500 text-sm">
//                 No loans due soon
//               </div>
//             )}
//           </div>

//           {/* Overdue */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
//               <div className="flex items-center gap-2">
//                 <AlertTriangle className="w-4 h-4 text-red-600" />
//                 <h3 className="font-semibold text-red-800 text-sm">Overdue</h3>
//                 <span className="ml-auto bg-red-200 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
//                   {overdueLoans.length}
//                 </span>
//               </div>
//             </div>
//             {overdueLoans.length > 0 ? (
//               <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
//                 {overdueLoans.slice(0, 3).map((loan) => {
//                   const daysOverdue = Math.abs(getDaysLeft(loan.dueDate));
//                   return (
//                     <Link
//                       key={loan._id}
//                       to={`/loans/${loan._id}`}
//                       className="block p-3 hover:bg-red-50 transition-colors"
//                     >
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 text-sm truncate">
//                             {loan.borrowerName}
//                           </p>
//                           <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
//                             <AlertCircle className="w-3 h-3" />
//                             {daysOverdue}d overdue
//                           </p>
//                         </div>
//                         <p className="font-semibold text-gray-900 text-sm ml-2">
//                           {formatCurrency(loan.loanAmount)}
//                         </p>
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="p-4 text-center text-gray-500 text-sm">
//                 No overdue loans
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Main Content Grid - Responsive */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//         {/* Recent Loans - Full width on mobile, 2 cols on desktop */}
//         <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
//             <div>
//               <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Loans</h2>
//               <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Latest activities</p>
//             </div>
//             <Link
//               to="/loans"
//               className="flex items-center gap-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700"
//             >
//               View All
//               <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//             </Link>
//           </div>

//           {recentLoans.length > 0 ? (
//             <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
//               {recentLoans.map((loan) => {
//                 const statusStyle = getStatusStyles(loan.status);
//                 const StatusIcon = statusStyle.icon;
//                 const daysLeftInfo = getRelativeTimeDisplay(loan.dueDate);
                
//                 return (
//                   <Link
//                     key={loan._id}
//                     to={`/loans/${loan._id}`}
//                     className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors group"
//                   >
//                     <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
//                       {/* Icon - Hidden on mobile, shown on tablet+ */}
//                       <div className={`hidden sm:block p-2 rounded-lg ${statusStyle.bg}`}>
//                         <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusStyle.iconColor}`} />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
//                           {loan.borrowerName}
//                         </p>
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <p className="text-xs sm:text-sm text-gray-500 truncate">
//                             {window.innerWidth > 640 
//                               ? (loan.borrowerEmail || 'No email')
//                               : formatDate(loan.dueDate)}
//                           </p>
//                           {/* Days left badge on mobile */}
//                           <span className={`inline-flex sm:hidden text-xs font-medium ${daysLeftInfo.color}`}>
//                             {daysLeftInfo.text}
//                           </span>
//                         </div>
//                         {/* Days left on desktop */}
//                         <p className={`hidden sm:block text-xs mt-1 font-medium ${daysLeftInfo.color}`}>
//                           {daysLeftInfo.text}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right flex items-center gap-2">
//                       <div>
//                         <p className="font-semibold text-gray-900 text-sm sm:text-base">
//                           {formatCurrency(loan.loanAmount)}
//                         </p>
//                         <p className="hidden sm:block text-xs sm:text-sm text-gray-500">
//                           Due {formatDate(loan.dueDate)}
//                         </p>
//                       </div>
//                       <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block group-hover:text-gray-600" />
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="p-6 sm:p-8 text-center">
//               <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
//               <p className="text-sm sm:text-base text-gray-500">No loans yet</p>
//               <Link
//                 to="/loans/new"
//                 className="inline-flex items-center gap-2 mt-4 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs sm:text-sm"
//               >
//                 <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
//                 Add Your First Loan
//               </Link>
//             </div>
//           )}
//         </div>

//         {/* Alerts Sidebar - Hidden on mobile (shown in toggle above) */}
//         <div className="hidden lg:block space-y-6">
//           {/* Due Soon */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-100 bg-yellow-50">
//               <div className="flex items-center gap-2">
//                 <Clock className="w-5 h-5 text-yellow-600" />
//                 <h3 className="font-semibold text-yellow-800">Due Soon</h3>
//                 <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
//                   {dueSoonLoans.length}
//                 </span>
//               </div>
//             </div>

//             {dueSoonLoans.length > 0 ? (
//               <div className="divide-y divide-gray-100">
//                 {dueSoonLoans.slice(0, 3).map((loan) => {
//                   const daysLeft = getDaysLeft(loan.dueDate);
//                   return (
//                     <Link
//                       key={loan._id}
//                       to={`/loans/${loan._id}`}
//                       className="block p-4 hover:bg-yellow-50 transition-colors"
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium text-gray-900">{loan.borrowerName}</p>
//                           <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
//                             <Calendar className="w-3 h-3" />
//                             {daysLeft === 0 ? 'Due today' : 
//                              daysLeft === 1 ? 'Due tomorrow' :
//                              `${daysLeft} days left`}
//                           </p>
//                         </div>
//                         <p className="font-semibold text-gray-900">
//                           {formatCurrency(loan.loanAmount)}
//                         </p>
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="p-4 text-center text-gray-500 text-sm">
//                 <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
//                 No loans due soon
//               </div>
//             )}

//             {dueSoonLoans.length > 3 && (
//               <Link
//                 to="/loans?status=dueSoon"
//                 className="block p-3 text-center text-sm text-yellow-600 hover:bg-yellow-50 border-t"
//               >
//                 View all {dueSoonLoans.length} due soon →
//               </Link>
//             )}
//           </div>

//           {/* Overdue */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
//               <div className="flex items-center gap-2">
//                 <AlertTriangle className="w-5 h-5 text-red-600" />
//                 <h3 className="font-semibold text-red-800">Overdue</h3>
//                 <span className="ml-auto bg-red-200 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
//                   {overdueLoans.length}
//                 </span>
//               </div>
//             </div>

//             {overdueLoans.length > 0 ? (
//               <div className="divide-y divide-gray-100">
//                 {overdueLoans.slice(0, 3).map((loan) => {
//                   const daysOverdue = Math.abs(getDaysLeft(loan.dueDate));
//                   return (
//                     <Link
//                       key={loan._id}
//                       to={`/loans/${loan._id}`}
//                       className="block p-4 hover:bg-red-50 transition-colors"
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium text-gray-900">{loan.borrowerName}</p>
//                           <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
//                             <AlertCircle className="w-3 h-3" />
//                             {daysOverdue} days overdue
//                           </p>
//                         </div>
//                         <p className="font-semibold text-gray-900">
//                           {formatCurrency(loan.loanAmount)}
//                         </p>
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="p-4 text-center text-gray-500 text-sm">
//                 <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
//                 No overdue loans
//               </div>
//             )}

//             {overdueLoans.length > 3 && (
//               <Link
//                 to="/loans?status=overdue"
//                 className="block p-3 text-center text-sm text-red-600 hover:bg-red-50 border-t"
//               >
//                 View all {overdueLoans.length} overdue →
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions - Responsive Grid */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//         <Link
//           to="/loans?status=active"
//           className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-green-200 transition-all group"
//         >
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
//               <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
//               <p className="text-xs sm:text-sm text-gray-500">Active</p>
//             </div>
//           </div>
//         </Link>

//         <Link
//           to="/loans?status=dueSoon"
//           className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-yellow-200 transition-all group"
//         >
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
//               <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.dueSoonCount}</p>
//               <p className="text-xs sm:text-sm text-gray-500">Due Soon</p>
//             </div>
//           </div>
//         </Link>

//         <Link
//           to="/loans?status=overdue"
//           className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-red-200 transition-all group"
//         >
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
//               <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
//             </div>
//             <div>
//               <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
//               <p className="text-xs sm:text-sm text-gray-500">Overdue</p>
//             </div>
//           </div>
//         </Link>

//         <Link
//           to="/loans?status=completed"
//           className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all group"
//         >
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
//               <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedLoans}</p>
//               <p className="text-xs sm:text-sm text-gray-500">Completed</p>
//             </div>
//           </div>
//         </Link>
//       </div>

//       {/* Footer CTA - Responsive */}
//       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
//         <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-center gap-3 sm:gap-4">
//           <div className="text-center sm:text-left">
//             <h3 className="text-lg sm:text-xl font-semibold">Need to track a new loan?</h3>
//             <p className="text-xs sm:text-sm text-indigo-100 mt-1">
//               {window.innerWidth > 640 
//                 ? "Add it now and never miss a due date with automatic reminders."
//                 : "Add loans and get automatic reminders."}
//             </p>
//           </div>
//           <Link
//             to="/loans/new"
//             className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-lg w-full sm:w-auto"
//           >
//             <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//             <span className="text-sm sm:text-base">Add New Loan</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;









import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  DollarSign, 
  TrendingUp,
  FileText, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  Activity,
  ChevronRight,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    totalLoanAmount: 0,
    totalInterest: 0,
    dueSoonCount: 0,
    overdueCount: 0,
    completedLoans: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [dueSoonLoans, setDueSoonLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileAlertsOpen, setMobileAlertsOpen] = useState(false);

  // Helper function to safely extract data from API response
  const extractData = useCallback((response) => {
    // Handle different response structures
    
    // Structure 1: Full axios response { data: { success, data }, status }
    if (response?.data?.success !== undefined) {
      return response.data.data;
    }
    
    // Structure 2: Already extracted { success, data }
    if (response?.success !== undefined) {
      return response.data;
    }
    
    // Structure 3: Direct data
    if (Array.isArray(response)) {
      return response;
    }
    
    return null;
  }, []);

  // Calculate stats from loans array
  const calculateStatsFromLoansArray = useCallback((loans) => {
    if (!Array.isArray(loans) || loans.length === 0) {
      console.log('⚠️ No loans to calculate stats from');
      return null;
    }

    const now = new Date();
    const calculatedStats = {
      totalLoans: loans.length,
      activeLoans: 0,
      totalLoanAmount: 0,
      totalInterest: 0,
      dueSoonCount: 0,
      overdueCount: 0,
      completedLoans: 0
    };

    const dueSoonList = [];
    const overdueList = [];

    loans.forEach(loan => {
      // Count by status
      const status = loan.status?.toLowerCase();
      if (status === 'active') {
        calculatedStats.activeLoans++;
      } else if (status === 'completed' || status === 'paid') {
        calculatedStats.completedLoans++;
      }

      // Calculate amounts
      calculatedStats.totalLoanAmount += parseFloat(loan.loanAmount || loan.amount || 0);
      calculatedStats.totalInterest += parseFloat(loan.interestAmount || loan.interest || 0);

      // Check due dates for active loans
      if (loan.dueDate && status === 'active') {
        const dueDate = new Date(loan.dueDate);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          calculatedStats.overdueCount++;
          overdueList.push(loan);
        } else if (diffDays <= 7) {
          calculatedStats.dueSoonCount++;
          dueSoonList.push(loan);
        }
      }
    });

    return {
      stats: calculatedStats,
      dueSoonList,
      overdueList,
      recentLoans: loans.slice(0, 5)
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching dashboard data...');

      // First, try to fetch all loans (most reliable)
      let allLoans = [];
      
      try {
        const loansResponse = await api.get('/loans?page=1&limit=100');
        console.log('📋 Raw Loans Response:', loansResponse);
        
        // Extract loans from response
        const loansData = extractData(loansResponse);
        console.log('📋 Extracted Loans Data:', loansData);
        
        if (Array.isArray(loansData)) {
          allLoans = loansData;
        } else if (loansData?.loans && Array.isArray(loansData.loans)) {
          allLoans = loansData.loans;
        }
        
        console.log('📋 Final Loans Array:', allLoans);
        console.log('📋 Loans Count:', allLoans.length);
      } catch (err) {
        console.error('❌ Error fetching loans:', err);
      }

      // Calculate stats from loans
      if (allLoans.length > 0) {
        const calculated = calculateStatsFromLoansArray(allLoans);
        
        if (calculated) {
          console.log('📊 Calculated Stats:', calculated.stats);
          
          setStats(calculated.stats);
          setRecentLoans(calculated.recentLoans);
          setDueSoonLoans(calculated.dueSoonList);
          setOverdueLoans(calculated.overdueList);
        }
      } else {
        // Try to fetch from statistics endpoint as fallback
        try {
          const statsResponse = await api.get('/loans/statistics');
          console.log('📊 Raw Stats Response:', statsResponse);
          
          const statsData = extractData(statsResponse);
          console.log('📊 Extracted Stats Data:', statsData);
          
          if (statsData) {
            setStats({
              totalLoans: statsData.totalLoans || statsData.total || 0,
              activeLoans: statsData.activeLoans || statsData.active || 0,
              totalLoanAmount: statsData.totalLoanAmount || statsData.totalAmount || 0,
              totalInterest: statsData.totalInterest || statsData.interest || 0,
              dueSoonCount: statsData.dueSoonCount || statsData.dueSoon || 0,
              overdueCount: statsData.overdueCount || statsData.overdue || 0,
              completedLoans: statsData.completedLoans || statsData.completed || 0
            });
          }
        } catch (err) {
          console.error('❌ Error fetching statistics:', err);
        }
      }

      // Try to fetch due soon loans
      try {
        const dueSoonResponse = await api.get('/loans/status/duesoon');
        const dueSoonData = extractData(dueSoonResponse);
        if (Array.isArray(dueSoonData)) {
          setDueSoonLoans(dueSoonData);
        }
      } catch (err) {
        console.log('⚠️ Due soon endpoint not available, using calculated data');
      }

      // Try to fetch overdue loans
      try {
        const overdueResponse = await api.get('/loans/status/overdue');
        const overdueData = extractData(overdueResponse);
        if (Array.isArray(overdueData)) {
          setOverdueLoans(overdueData);
        }
      } catch (err) {
        console.log('⚠️ Overdue endpoint not available, using calculated data');
      }

    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [extractData, calculateStatsFromLoansArray]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 Stats State Updated:', stats);
  }, [stats]);

  // Format currency
  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get days left
  const getDaysLeft = (date) => {
    if (!date) return null;
    const now = new Date();
    const target = new Date(date);
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get relative time display
  const getRelativeTimeDisplay = (date) => {
    const days = getDaysLeft(date);
    
    if (days === null) return { text: 'No due date', color: 'text-gray-500' };
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'text-red-600' };
    if (days === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (days === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    if (days <= 7) return { text: `${days}d left`, color: 'text-yellow-600' };
    return { text: `${days}d left`, color: 'text-green-600' };
  };

  // Get status styles
  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase() || 'active';
    const styles = {
      active: { bg: 'bg-green-100', icon: CheckCircle, iconColor: 'text-green-500' },
      duesoon: { bg: 'bg-yellow-100', icon: Clock, iconColor: 'text-yellow-500' },
      overdue: { bg: 'bg-red-100', icon: AlertTriangle, iconColor: 'text-red-500' },
      completed: { bg: 'bg-blue-100', icon: CheckCircle, iconColor: 'text-blue-500' },
      paid: { bg: 'bg-blue-100', icon: CheckCircle, iconColor: 'text-blue-500' }
    };
    return styles[statusLower] || styles.active;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Here's what's happening with your loans today.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/loans/new"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Loans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Loans</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {stats.totalLoans}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {stats.activeLoans} active
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
              <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalLoanAmount)}
              </p>
              <p className="text-xs sm:text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Outstanding</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Interest */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Interest</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalInterest)}
              </p>
              <p className="text-xs sm:text-sm text-purple-600 mt-1 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Expected</span>
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Attention</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {stats.dueSoonCount + stats.overdueCount}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <span className="text-xs sm:text-sm text-yellow-600">
                  {stats.dueSoonCount} soon
                </span>
                <span className="text-xs sm:text-sm text-red-600">
                  {stats.overdueCount} late
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-xl">
              <AlertCircle className="w-5 h-5 sm:w-7 sm:h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Alerts Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileAlertsOpen(!mobileAlertsOpen)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="font-medium">View Alerts</span>
            <span className="text-sm text-gray-500">
              ({stats.dueSoonCount + stats.overdueCount})
            </span>
          </div>
          {mobileAlertsOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Alerts Content */}
      {mobileAlertsOpen && (
        <div className="lg:hidden space-y-4">
          {/* Due Soon Mobile */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-4 py-3 bg-yellow-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Due Soon</h3>
              </div>
              <span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {dueSoonLoans.length}
              </span>
            </div>
            {dueSoonLoans.length > 0 ? (
              <div className="divide-y">
                {dueSoonLoans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan._id}
                    to={`/loans/${loan._id}`}
                    className="block p-3 hover:bg-yellow-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{loan.borrowerName}</p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          {getRelativeTimeDisplay(loan.dueDate).text}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">{formatCurrency(loan.loanAmount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No loans due soon</div>
            )}
          </div>

          {/* Overdue Mobile */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-red-800">Overdue</h3>
              </div>
              <span className="bg-red-200 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {overdueLoans.length}
              </span>
            </div>
            {overdueLoans.length > 0 ? (
              <div className="divide-y">
                {overdueLoans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan._id}
                    to={`/loans/${loan._id}`}
                    className="block p-3 hover:bg-red-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{loan.borrowerName}</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          {getRelativeTimeDisplay(loan.dueDate).text}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">{formatCurrency(loan.loanAmount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No overdue loans</div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Loans */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Loans</h2>
              <p className="text-sm text-gray-500">Latest activities</p>
            </div>
            <Link
              to="/loans"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentLoans.length > 0 ? (
            <div className="divide-y">
              {recentLoans.map((loan) => {
                const statusStyle = getStatusStyles(loan.status);
                const StatusIcon = statusStyle.icon;
                const daysInfo = getRelativeTimeDisplay(loan.dueDate);
                
                return (
                  <Link
                    key={loan._id}
                    to={`/loans/${loan._id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`hidden sm:flex p-2 rounded-lg ${statusStyle.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusStyle.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{loan.borrowerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium ${daysInfo.color}`}>
                            {daysInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        Due {formatDate(loan.dueDate)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No loans yet</p>
              <Link
                to="/loans/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Your First Loan
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Alerts Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Due Soon */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 bg-yellow-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Due Soon</h3>
              </div>
              <span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {dueSoonLoans.length}
              </span>
            </div>
            {dueSoonLoans.length > 0 ? (
              <div className="divide-y">
                {dueSoonLoans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan._id}
                    to={`/loans/${loan._id}`}
                    className="block p-4 hover:bg-yellow-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{loan.borrowerName}</p>
                        <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {getRelativeTimeDisplay(loan.dueDate).text}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(loan.loanAmount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                No loans due soon
              </div>
            )}
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Overdue</h3>
              </div>
              <span className="bg-red-200 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {overdueLoans.length}
              </span>
            </div>
            {overdueLoans.length > 0 ? (
              <div className="divide-y">
                {overdueLoans.slice(0, 3).map((loan) => (
                  <Link
                    key={loan._id}
                    to={`/loans/${loan._id}`}
                    className="block p-4 hover:bg-red-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{loan.borrowerName}</p>
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {getRelativeTimeDisplay(loan.dueDate).text}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(loan.loanAmount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                No overdue loans
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/loans?status=active"
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-green-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Link>

        <Link
          to="/loans?status=dueSoon"
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-yellow-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.dueSoonCount}</p>
              <p className="text-sm text-gray-500">Due Soon</p>
            </div>
          </div>
        </Link>

        <Link
          to="/loans?status=overdue"
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </Link>

        <Link
          to="/loans?status=completed"
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedLoans}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold">Need to track a new loan?</h3>
            <p className="text-indigo-100 mt-1">Add it now and never miss a due date.</p>
          </div>
          <Link
            to="/loans/new"
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-lg w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add New Loan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
