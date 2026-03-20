import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, getDoc, where, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import {
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  UserCircle2,
  Phone,
  Mail,
  Calendar,
  X,
  ClipboardList
} from 'lucide-react';

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
    <div className="flex bg-surface min-h-screen text-aura-dark font-sans selection:bg-primary/10">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-[#2D2926]/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="p-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform">
            FL
          </div>
          <div>
            <span className="font-serif font-black tracking-tight text-xl block leading-none">FLORYA</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1 block">ADMIN PORTAL</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 pt-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-widest text-aura-dark/30 mb-4">Navigation</p>
          <button className="w-full flex items-center gap-4 px-4 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/20 group">
            <Users size={18} className="transition-transform group-hover:scale-110" />
            Patient Repository
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3.5 text-aura-dark/60 hover:bg-surface-elevated hover:text-aura-dark rounded-2xl font-bold text-sm transition-all group">
            <Activity size={18} className="transition-transform group-hover:scale-110" />
            Clinical Insights
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3.5 text-aura-dark/60 hover:bg-surface-elevated hover:text-aura-dark rounded-2xl font-bold text-sm transition-all group">
            <FileText size={18} className="transition-transform group-hover:scale-110" />
            Lab Queue
          </button>
        </nav>

        <div className="p-8 border-t border-[#2D2926]/5 bg-surface-elevated/20">
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#2D2926]/5 shadow-sm">
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
      <main className="flex-1 p-8 lg:p-16 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/40">Live Monitoring</span>
            </div>
            <h1 className="text-5xl font-serif font-black tracking-tight">Patient Dashboard</h1>
            <p className="text-base text-aura-dark/50 font-medium">Tracking {users.length} active clinical pathways.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-aura-dark/20" size={18} />
              <input
                type="text"
                placeholder="Search demographics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 bg-white border border-[#2D2926]/10 rounded-2xl text-sm w-full md:w-80 font-medium focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className="w-12 h-12 bg-primary-dim text-primary rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Users size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/40 mb-2">Total Outreach</p>
            <div className="flex justify-between items-end">
              <h3 className="text-5xl font-serif font-black leading-none">{users.length}</h3>
              <div className="flex items-center gap-1.5 text-green-600 text-[11px] font-black bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <TrendingUp size={14} />
                +12%
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <AlertCircle size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/40 mb-2">Assessments Pending</p>
            <h3 className="text-5xl font-serif font-black leading-none">{stats.pending}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-[#2D2926]/5 shadow-sm hover:shadow-xl hover:shadow-primary-light/5 transition-all group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Activity size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/40 mb-2">Lab Uploads Today</p>
            <h3 className="text-5xl font-serif font-black leading-none text-aura-dark">{stats.labQueue}</h3>
          </div>
        </div>

        {/* User Table Header */}
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-2xl font-serif font-black">Recent Assessments</h2>
          <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors border-b-2 border-primary/20 hover:border-primary-dark/40 pb-1">
            <Filter size={14} /> View All Filters
          </button>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-[40px] border border-[#2D2926]/10 shadow-2xl shadow-[#2D2926]/5 overflow-hidden ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated/30 text-[10px] font-black uppercase tracking-[0.2em] text-aura-dark/50">
                  <th className="px-10 py-8">Full Name</th>
                  <th className="px-10 py-8">Contact Details</th>
                  <th className="px-10 py-8">Protocol Progression</th>
                  <th className="px-10 py-8">Registration</th>
                  <th className="px-10 py-8"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-aura-dark/40 font-bold italic">Initializing data stream...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center text-aura-dark/40 italic font-bold">No patients matching search criteria.</td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-[#2D2926]/5 hover:bg-surface-elevated/40 transition-all group cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-dim text-primary flex items-center justify-center font-black text-xs shadow-sm border border-primary/10 transition-transform group-hover:scale-105 group-hover:rotate-2">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-aura-dark text-base tracking-tight leading-none group-hover:text-primary transition-colors">{user.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-aura-dark/40 font-bold tracking-widest uppercase">P-ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-aura-dark/60 font-bold text-xs uppercase tracking-tight">
                          <Mail size={12} className="text-aura-dark/20" /> {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-aura-dark/40 font-bold text-[10px] uppercase tracking-widest">
                          <Phone size={12} className="text-aura-dark/20" /> {user.mobile || 'Verification Pending'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] w-fit ${user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed'
                          ? 'bg-green-50 text-green-600 border border-green-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          {user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {user.lastCompletedStep?.replace('_', ' ') || 'Initial Contact'}
                        </span>
                        <div className="w-24 h-1 bg-surface-elevated rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${user.lastCompletedStep === 'questionnaire_completed' || user.lastCompletedStep === 'results_viewed' || user.lastCompletedStep === 'registration_completed' ? 'w-full bg-green-500' : 'w-1/2 bg-amber-500'}`}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 text-aura-dark/60 font-black text-xs">
                        <Calendar size={14} className="text-aura-dark/20" />
                        {user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt)).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-aura-dark/10 group-hover:text-primary group-hover:bg-primary-dim transition-all transform group-hover:translate-x-1">
                        <ChevronRight size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Details Modal (Drawer) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-aura-dark/40 backdrop-blur-md transition-all duration-500" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-3xl bg-surface h-full shadow-2xl animate-slide-in p-16 overflow-y-auto ring-1 ring-black/5">
            <button
              className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white border border-[#2D2926]/10 flex items-center justify-center text-aura-dark/40 hover:text-aura-dark hover:border-aura-dark transition-all hover:rotate-90"
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
                          <div className="py-4 flex items-center gap-3 text-sm italic text-aura-dark/40">
                            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                            Running assessment engine...
                          </div>
                        ) : userResults ? (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userResults.allRisks?.slice(0, 7).map((risk: any) => (
                                <div key={risk.id} className="bg-surface-elevated/50 p-5 rounded-2xl border border-[#2D2926]/5 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-aura-dark/60">{risk.label}</p>
                                    <span className={`text-[11px] font-black ${risk.score > 70 ? 'text-red-600' : risk.score > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                                      {risk.score}%
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-1000 ${risk.score > 70 ? 'bg-red-500' : risk.score > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                                      style={{ width: `${risk.score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
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
                          <div className="py-4 flex items-center gap-3 text-sm italic text-aura-dark/40">
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            Prioritizing markers...
                          </div>
                        ) : userResults?.tests ? (
                          <div className="flex flex-wrap gap-2">
                            {userResults.tests.map((test: any, i: number) => (
                              <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-100 italic">
                                {test.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-[#2D2926]/5 rounded-2xl text-center italic text-sm text-aura-dark/40">
                            Data required to generate recommendations.
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
                          <div className="flex items-center gap-3 text-sm italic text-aura-dark/40 py-8">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Securely retrieving responses...
                          </div>
                        ) : userAnswers ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(userAnswers).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                return (
                                  <div key={key} className="bg-surface-elevated/50 p-4 rounded-xl border border-[#2D2926]/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-aura-dark/40 mb-1">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-sm font-bold text-aura-dark capitalize">{String(value)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 italic text-sm text-aura-dark/60 bg-surface-elevated/50 p-8 border-2 border-dashed border-[#2D2926]/5 rounded-3xl text-center">
                            <Activity size={24} className="mx-auto mb-4 opacity-20" />
                            No questionnaire data found for this patient yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
