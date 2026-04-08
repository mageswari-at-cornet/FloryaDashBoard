import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, getDoc, where, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import {
  Users,
  Search,
  TrendingUp,
  Filter,
  AlertCircle,
  FileText,
  Activity,
  UserCircle2,
  Phone,
  Mail,
  Calendar,
  X,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [userResults, setUserResults] = useState<any>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    labQueue: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch Users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);

        // Calculate Pending Assessments
        const pendingCount = usersData.filter((u: any) => u.lastCompletedStep !== 'questionnaire_completed' && u.lastCompletedStep !== 'results_viewed' && u.lastCompletedStep !== 'registration_completed').length;

        // Fetch Lab Queue (Uploaded Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const docsQuery = query(
          collection(db, "user_documents"),
          where("uploadedAt", ">=", Timestamp.fromDate(today))
        );
        const docsSnapshot = await getDocs(docsQuery);

        setStats({
          pending: pendingCount,
          labQueue: docsSnapshot.size
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!selectedUser) {
        setUserAnswers(null);
        setUserResults(null);
        return;
      }

      setLoadingAnswers(true);
      try {
        // Fetch Answers
        const answersRef = doc(db, "user_answers", selectedUser.id);
        const answersSnap = await getDoc(answersRef);
        if (answersSnap.exists()) {
          setUserAnswers(answersSnap.data().answers);
        } else {
          setUserAnswers(null);
        }

        // Fetch Results
        const resultsRef = doc(db, "user_results", selectedUser.id);
        const resultsSnap = await getDoc(resultsRef);
        if (resultsSnap.exists()) {
          setUserResults(resultsSnap.data().results);
        } else {
          setUserResults(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingAnswers(false);
      }
    }
    fetchUserData();
  }, [selectedUser]);

  const filteredUsers = users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-mesh-gradient min-h-screen text-aura-dark font-sans selection:bg-primary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -120, 0],
            opacity: [0.02, 0.04, 0.02] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary-light rounded-full blur-[120px]"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-72 glass-panel border-r border-[#2D2926]/5 flex flex-col hidden lg:flex sticky top-0 h-screen z-20">
        <div className="p-10 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 0, scale: 1.1 }}
            initial={{ rotate: 3 }}
            className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20 transform transition-transform"
          >
            FL
          </motion.div>
          <div>
            <span className="font-serif font-black tracking-tight text-xl block leading-none">FLORYA</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1 block">ADMIN PORTAL</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 pt-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-aura-dark/30 mb-4 px-4">Navigation</p>
          <motion.button 
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-4 px-4 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/20 group"
          >
            <Users size={18} className="transition-transform group-hover:scale-110" />
            Patient Repository
          </motion.button>
          <motion.button 
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-aura-dark/60 hover:bg-white/50 hover:text-aura-dark rounded-2xl font-bold text-sm transition-all group"
          >
            <Activity size={18} className="transition-transform group-hover:scale-110" />
            Clinical Insights
          </motion.button>
          <motion.button 
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-aura-dark/60 hover:bg-white/50 hover:text-aura-dark rounded-2xl font-bold text-sm transition-all group"
          >
            <FileText size={18} className="transition-transform group-hover:scale-110" />
            Lab Queue
          </motion.button>
        </nav>

        <div className="p-8 border-t border-[#2D2926]/5">
          <div className="flex items-center gap-4 p-4 glass-panel rounded-2xl border border-[#2D2926]/5">
            <div className="w-10 h-10 rounded-xl bg-primary-dim text-primary flex items-center justify-center font-black text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-black">Admin Console</p>
              <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Standard Role</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 p-8 lg:p-16 max-w-7xl mx-auto w-full z-10"
      >
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="relative">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full block animate-pulse"></span>
                <span className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full block animate-ping opacity-25"></span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Live Monitoring System</span>
            </motion.div>
            <h1 className="text-6xl font-serif font-black tracking-tighter leading-[0.9]">Patient<br />Dashboard</h1>
            <p className="text-lg text-aura-dark/40 font-medium max-w-md">Overseeing {users.length} active clinical pathways with real-time risk stratification.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-aura-dark/20" size={18} />
              <input
                type="text"
                placeholder="Search patient demographics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-5 bg-white border border-[#2D2926]/5 rounded-2xl text-sm w-full md:w-96 font-medium focus:outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all shadow-premium"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-6 lg:col-span-5 glass-panel-heavy p-10 rounded-[40px] relative overflow-hidden group border-white/40"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
              <Users size={80} />
            </div>
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-primary/20">
              <Users size={28} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-aura-dark/30 mb-3">Total Patient Outreach</p>
            <div className="flex justify-between items-end">
              <h3 className="text-7xl font-serif font-black leading-none tracking-tighter">{users.length}</h3>
              <div className="flex items-center gap-2 text-green-600 text-xs font-black bg-green-50 px-4 py-2 rounded-full border border-green-100/50 shadow-sm">
                <TrendingUp size={16} />
                +12.4%
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-6 lg:col-span-3 glass-panel p-10 rounded-[40px] border-white/20"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-10">
              <AlertCircle size={28} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-aura-dark/30 mb-3">Critical Pending</p>
            <h3 className="text-7xl font-serif font-black leading-none tracking-tighter text-amber-600">{stats.pending}</h3>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8 }}
            className="md:col-span-12 lg:col-span-4 glass-panel p-10 rounded-[40px] border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={80} />
            </div>
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-10">
              <Activity size={28} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-aura-dark/30 mb-3">Lab Uploads Today</p>
            <div className="flex items-center gap-4">
              <h3 className="text-7xl font-serif font-black leading-none tracking-tighter">{stats.labQueue}</h3>
              <div className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded-md uppercase tracking-widest border border-purple-100/50">High Vol</div>
            </div>
          </motion.div>
        </div>

        {/* User Table Header */}
        <div className="flex items-center justify-between mb-10 px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-serif font-black tracking-tight">Recent Assessments</h2>
            <div className="px-3 py-1 bg-primary-dim text-primary text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary/10">Active Stream</div>
          </div>
          <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary-dark transition-all border-b-2 border-primary/10 hover:border-primary/30 pb-1.5 px-1">
            <Filter size={14} /> Full Registry Filter
          </button>
        </div>

        {/* User Table */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel rounded-[48px] overflow-hidden border-white/40 shadow-2xl shadow-aura-dark/5"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 text-[11px] font-black uppercase tracking-[0.25em] text-aura-dark/30 border-b border-aura-dark/5">
                  <th className="px-12 py-10">Patient Profile</th>
                  <th className="px-12 py-10">Verification & Contact</th>
                  <th className="px-12 py-10">Pathway Status</th>
                  <th className="px-12 py-10">Enrollment</th>
                  <th className="px-12 py-10 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-12 py-40 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 border-[5px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                          <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                        </div>
                        <p className="text-aura-dark/30 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Clinical Stream...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-12 py-40 text-center text-aura-dark/30 italic font-medium text-lg">No clinical records match your current criteria.</td>
                  </tr>
                ) : filteredUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    key={user.id} 
                    className="group cursor-pointer hover:bg-white/60 transition-all border-b border-aura-dark/[0.03] last:border-0" 
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-aura-dark/5 text-primary flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 group-hover:-rotate-3 overflow-hidden relative">
                          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-black text-aura-dark text-lg tracking-tight leading-none group-hover:text-primary transition-colors">{user.name || 'Anonymous Patient'}</p>
                          <div className="flex items-center gap-2">
                             <ShieldCheck size={10} className="text-green-500" />
                             <p className="text-[10px] text-aura-dark/30 font-black tracking-[0.15em] uppercase">Ref: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 text-aura-dark/50 font-bold text-xs">
                          <Mail size={14} className="text-primary/30" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2.5 text-aura-dark/30 font-black text-[10px] uppercase tracking-wider">
                          <Phone size={14} className="text-primary/20" /> {user.mobile || 'Pending Auth'}
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex flex-col gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] w-fit shadow-sm ${user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed'
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                          {user.lastCompletedStep?.replace(/_/g, ' ') || 'New Submission'}
                        </span>
                        <div className="w-32 h-1.5 bg-aura-dark/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed' ? '100%' : '50%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed' ? 'bg-green-500' : 'bg-amber-500'}`}
                          ></motion.div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex items-center gap-3 text-aura-dark/50 font-black text-xs">
                        <div className="w-8 h-8 rounded-full bg-aura-dark/[0.03] flex items-center justify-center">
                          <Calendar size={14} className="text-aura-dark/20" />
                        </div>
                        {user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <motion.div 
                        whileHover={{ x: 6, backgroundColor: 'rgba(176, 91, 67, 0.1)' }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-aura-dark/20 group-hover:text-primary transition-all border border-transparent group-hover:border-primary/10 inline-flex"
                      >
                        <ArrowUpRight size={22} />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.main>

      {/* User Details Modal (Drawer) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-aura-dark/20 backdrop-blur-[8px] transition-all" 
              onClick={() => setSelectedUser(null)} 
            />
            <motion.div 
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl bg-surface-elevated h-full shadow-2xl p-12 lg:p-20 overflow-y-auto ring-1 ring-black/5"
            >
              <button
                className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white border border-[#2D2926]/5 flex items-center justify-center text-aura-dark/20 hover:text-primary hover:border-primary/20 transition-all hover:rotate-90 shadow-sm"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>

            <header className="mb-16">
              <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-[32px] bg-primary-dim text-primary flex items-center justify-center font-black text-4xl shadow-inner border border-primary/10">
                  {selectedUser.name?.charAt(0) || '?'}
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                    <UserCircle2 size={12} /> Active Case
                  </div>
                  <h2 className="text-6xl font-serif font-black tracking-tighter leading-none">{selectedUser.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border border-[#2D2926]/5 shadow-sm space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-aura-dark/30">Primary Contact</p>
                  <p className="text-sm font-bold text-aura-dark">{selectedUser.email}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-[#2D2926]/5 shadow-sm space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-aura-dark/30">Mobile Register</p>
                  <p className="text-sm font-bold text-aura-dark">{selectedUser.mobile || 'N/A'}</p>
                </div>
              </div>
            </header>

            <section className="space-y-16">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Patient Timeline</h3>
                  <div className="h-px flex-1 bg-primary/10 mx-6"></div>
                </div>

                <div className="flex flex-col gap-6 w-full">
                  {/* Clinical Insights Card */}
                  <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm relative overflow-hidden group w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-start gap-6">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-600/20">
                        <Activity size={20} />
                      </div>
                      <div className="space-y-6 flex-1 w-full">
                        <div>
                          <p className="text-lg font-black tracking-tight mb-1">Clinical Risk Assessment</p>
                          <p className="text-xs text-aura-dark/40 font-medium">Calculated risk markers and health signals</p>
                        </div>

                        {loadingAnswers ? (
                          <div className="py-12 flex flex-col items-center gap-4 text-sm italic text-aura-dark/30">
                            <div className="w-10 h-10 border-4 border-amber-600/10 border-t-amber-600 rounded-full animate-spin"></div>
                            Processing high-fidelity clinical markers...
                          </div>
                        ) : userResults ? (
                          <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={{
                              hidden: { opacity: 0 },
                              visible: {
                                opacity: 1,
                                transition: {
                                  staggerChildren: 0.1
                                }
                              }
                            }}
                            className="space-y-8"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userResults.allRisks?.slice(0, 8).map((risk: any) => (
                                <motion.div 
                                  variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                  }}
                                  key={risk.id} 
                                  className="bg-white p-6 rounded-3xl border border-aura-dark/[0.03] space-y-4 hover:shadow-lg hover:shadow-aura-dark/5 transition-all group/card"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${risk.score > 70 ? 'bg-red-500' : risk.score > 40 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/40">{risk.label}</p>
                                    </div>
                                    <span className={`text-xs font-black ${risk.score > 70 ? 'text-red-600' : risk.score > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                                      {risk.score}%
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-aura-dark/[0.03] rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${risk.score}%` }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className={`h-full rounded-full ${risk.score > 70 ? 'bg-red-500' : risk.score > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                                    ></motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-[#2D2926]/5 rounded-2xl text-center italic text-sm text-aura-dark/40">
                            Assessment results pending completion.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lab Recommendations Card */}
                  <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm relative overflow-hidden group w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex items-start gap-6">
                      <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                        <Activity size={20} />
                      </div>
                      <div className="space-y-6 flex-1 w-full">
                        <div>
                          <p className="text-lg font-black tracking-tight mb-1">Recommended Laboratory Monitoring</p>
                          <p className="text-xs text-aura-dark/40 font-medium">Prioritized tests based on clinical markers</p>
                        </div>

                        {loadingAnswers ? (
                          <div className="py-8 flex items-center gap-4 text-sm italic text-aura-dark/30">
                            <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            Prioritizing diagnostic markers...
                          </div>
                        ) : userResults?.tests ? (
                          <div className="flex flex-wrap gap-3">
                            {userResults.tests.map((test: any, i: number) => (
                              <motion.span 
                                whileHover={{ scale: 1.05, y: -2 }}
                                key={i} 
                                className="px-5 py-3 bg-white text-purple-700 text-xs font-black rounded-2xl border border-purple-100 shadow-sm flex items-center gap-2 group/test cursor-default"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover/test:scale-150 transition-transform"></div>
                                {test.name}
                              </motion.span>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 border-2 border-dashed border-aura-dark/5 rounded-[32px] text-center italic text-sm text-aura-dark/30 flex flex-col items-center gap-4">
                            <Activity size={32} className="opacity-10" />
                            Clinical data required for lab synthesis.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Raw Answers Card */}
                  <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm relative overflow-hidden group w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-16 -mt-16 transition-all group-hover:w-40 group-hover:h-40"></div>
                    <div className="relative z-10 flex items-start gap-6">
                      <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <ClipboardList size={20} />
                      </div>
                      <div className="space-y-6 flex-1">
                        <div>
                          <p className="text-lg font-black tracking-tight mb-1">Detailed Clinical Responses</p>
                          <p className="text-xs text-aura-dark/40 font-medium">Standardized data entry responses</p>
                        </div>

                        {loadingAnswers ? (
                          <div className="flex flex-col items-center gap-4 py-16">
                            <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-sm italic text-aura-dark/30">Securely decanting patient responses...</p>
                          </div>
                        ) : userAnswers ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(userAnswers).map(([key, value]) => {
                              if (typeof value === 'object' && value !== null) return null;
                              return (
                                <div key={key} className="bg-white p-5 rounded-2xl border border-aura-dark/[0.03] space-y-1 group/row hover:border-primary/10 transition-colors">
                                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-aura-dark/20 group-hover/row:text-primary/40 transition-colors">{key.replace(/_/g, ' ')}</p>
                                  <p className="text-sm font-bold text-aura-dark/80">{String(value)}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="italic text-sm text-aura-dark/30 bg-white/50 p-12 border-2 border-dashed border-aura-dark/5 rounded-[32px] text-center flex flex-col items-center gap-4">
                            <ClipboardList size={32} className="opacity-10" />
                            Questionnaire data stream has not yet initialized.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
