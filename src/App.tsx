/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  PieChart, 
  Coins, 
  Briefcase, 
  ChevronRight, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  ArrowRightLeft,
  Trophy
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { getMentorResponse } from './services/mentorService';

type AppMode = 'home' | 'corporativas' | 'personales';
type Step = 'selection' | 'translation' | 'simulation' | 'challenge' | 'feedback';

interface Indicator {
  id: string;
  name: string;
  acronym: string;
  category: string;
  description: string;
  mode: 'corporativas' | 'personales';
}

const INDICATORS: Indicator[] = [
  // CORPORATIVAS
  { id: 'ROE', acronym: 'ROE', name: 'Rentabilidad sobre el Patrimonio', category: 'Rentabilidad', description: 'Mide la ganancia respecto a la inversión de los socios.', mode: 'corporativas' },
  { id: 'ROA', acronym: 'ROA', name: 'Rentabilidad sobre Activos', category: 'Rentabilidad', description: 'Mide la eficacia en el uso de los activos.', mode: 'corporativas' },
  { id: 'ROIC', acronym: 'ROIC', name: 'Retorno sobre el Capital Invertido', category: 'Rentabilidad', description: 'Mide el retorno generado por el capital operativo.', mode: 'corporativas' },
  { id: 'Margen Neto', acronym: 'MN', name: 'Margen Neto', category: 'Rentabilidad', description: 'Porcentaje de ganancia final después de todos los gastos.', mode: 'corporativas' },
  { id: 'Margen Operativo', acronym: 'MO', name: 'Margen Operativo', category: 'Rentabilidad', description: 'Eficiencia operativa antes de impuestos e intereses.', mode: 'corporativas' },
  { id: 'Razón Corriente', acronym: 'RC', name: 'Razón Corriente', category: 'Liquidez', description: 'Capacidad para pagar deudas de corto plazo.', mode: 'corporativas' },
  { id: 'Prueba Ácida', acronym: 'PA', name: 'Prueba Ácida', category: 'Liquidez', description: 'Liquidez inmediata sin depender de inventarios.', mode: 'corporativas' },
  { id: 'Nivel de Endeudamiento', acronym: 'NE', name: 'Nivel de Endeudamiento', category: 'Endeudamiento', description: 'Proporción de activos financiados por terceros.', mode: 'corporativas' },
  { id: 'Cobertura de Intereses', acronym: 'CI', name: 'Cobertura de Intereses', category: 'Endeudamiento', description: 'Capacidad para cumplir con obligaciones financieras.', mode: 'corporativas' },
  { id: 'WACC', acronym: 'WACC', name: 'Costo Promedio Ponderado de Capital', category: 'Endeudamiento', description: 'Promedio del costo de todas las fuentes de capital.', mode: 'corporativas' },
  { id: 'Rotación de Inventarios', acronym: 'RI', name: 'Rotación de Inventarios', category: 'Eficiencia', description: 'Velocidad con la que se vende la mercancía.', mode: 'corporativas' },
  { id: 'Rotación de Cartera', acronym: 'RT', name: 'Rotación de Cartera', category: 'Eficiencia', description: 'Rapidez para cobrar a los clientes.', mode: 'corporativas' },
  { id: 'EBITDA', acronym: 'EBITDA', name: 'Utilidad Operativa + Depreciación', category: 'Flujo y Valor', description: 'Caja operativa generada por el negocio.', mode: 'corporativas' },
  { id: 'Flujo de Caja Libre', acronym: 'FCL', name: 'Flujo de Caja Libre', category: 'Flujo y Valor', description: 'Efectivo disponible después de inversiones necesarias.', mode: 'corporativas' },
  { id: 'EVA', acronym: 'EVA', name: 'Valor Económico Agregado', category: 'Flujo y Valor', description: 'Riqueza generada por encima del costo de capital.', mode: 'corporativas' },
  { id: 'NOF', acronym: 'NOF', name: 'Necesidades Operativas de Fondos', category: 'Flujo y Valor', description: 'Capital necesario para operar el día a día.', mode: 'corporativas' },
  
  // PERSONALES
  { id: 'Capacidad de Ahorro', acronym: 'CA', name: 'Capacidad de Ahorro', category: 'Personal', description: 'Porcentaje de ingresos que sobran tras gastos.', mode: 'personales' },
  { id: 'Endeudamiento Personal', acronym: 'EP', name: 'Nivel de Endeudamiento', category: 'Personal', description: 'Qué tanto de tu sueldo se va en pagar deudas.', mode: 'personales' },
  { id: 'Fondo de Emergencia', acronym: 'FE', name: 'Fondo de Emergencia', category: 'Personal', description: 'Colchón de dinero para imprevistos.', mode: 'personales' },
  { id: 'Uso de Tarjeta', acronym: 'TC', name: 'Uso de Tarjeta de Crédito', category: 'Personal', description: 'Eficiencia en el manejo de crédito rotativo.', mode: 'personales' },
  { id: 'Gastos Hormiga', acronym: 'GH', name: 'Gastos Hormiga', category: 'Personal', description: 'Pequeños gastos que destruyen tu ahorro.', mode: 'personales' },
  { id: 'Patrimonio Neto', acronym: 'PN', name: 'Patrimonio Neto Personal', category: 'Personal', description: 'Lo que tienes menos lo que debes.', mode: 'personales' },
];

const CATEGORIES = ['Rentabilidad', 'Liquidez', 'Endeudamiento', 'Eficiencia', 'Flujo y Valor', 'Personal'];

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('home');
  const [step, setStep] = useState<Step>('selection');
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; feedbackDetail: string; whatEvaluated: string } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Dashboard Stats Logic
  const [stats, setStats] = useState({
    challenges: 0,
    correct: 0,
    incorrect: 0,
    mostStudied: {} as Record<string, number>,
    commonErrors: {} as Record<string, number>
  });

  // Persistence: Load stats on mount
  useEffect(() => {
    // Reset stats for the new structure as requested
    const savedStats = localStorage.getItem('mentor_impact_stats_v2');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        // Ensure challenges/correct/incorrect are numbers and commonErrors/mostStudied are objects
        setStats({
          challenges: Number(parsed.challenges) || 0,
          correct: Number(parsed.correct) || 0,
          incorrect: Number(parsed.incorrect) || 0,
          mostStudied: typeof parsed.mostStudied === 'object' ? parsed.mostStudied : {},
          commonErrors: typeof parsed.commonErrors === 'object' ? parsed.commonErrors : {}
        });
      } catch (e) {
        console.error("Error loading stats", e);
      }
    }
  }, []);

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem('mentor_impact_stats_v2', JSON.stringify(stats));
  }, [stats]);

  const recordInteraction = (id: string | undefined) => {
    if (!id) return;
    setStats(prev => ({
      ...prev,
      mostStudied: {
        ...prev.mostStudied,
        [id]: (prev.mostStudied[id] || 0) + 1
      }
    }));
  };

  const startCycle = async (selected: string) => {
    setShowAnalysis(false);
    const list = INDICATORS.filter(i => i.mode === appMode);
    const finalIndicator = selected === 'Aleatorio' 
      ? list[Math.floor(Math.random() * list.length)]
      : INDICATORS.find(i => i.id === selected) || list[0];
    
    setIndicator(finalIndicator);
    recordInteraction(finalIndicator.id);
    setLoading(true);
    try {
      const data = await getMentorResponse(2, finalIndicator.name, appMode === 'corporativas' ? 'corporativas' : 'personales');
      setContent(data);
      setStep('translation');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 'translation') {
        const data = await getMentorResponse(3, indicator?.name || '', appMode === 'corporativas' ? 'corporativas' : 'personales');
        setContent(data);
        setStep('simulation');
      } else if (step === 'simulation') {
        const data = await getMentorResponse(4, indicator?.name || '', appMode === 'corporativas' ? 'corporativas' : 'personales');
        setContent(data);
        setStep('challenge');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (choice: string) => {
    setUserChoice(choice);
    const isCorrect = choice === content.correct;
    
    setResult({
      isCorrect,
      feedbackDetail: content.feedbackDetail[choice],
      whatEvaluated: content.whatEvaluated
    });

    // Update real stats
    setStats(prev => ({
      ...prev,
      challenges: prev.challenges + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      commonErrors: !isCorrect && indicator ? {
        ...prev.commonErrors,
        [indicator.category]: (prev.commonErrors[indicator.category] || 0) + 1
      } : prev.commonErrors
    }));

    setStep('feedback');
    setShowAnalysis(false);
  };

  const reset = () => {
    setAppMode('home');
    setStep('selection');
    setIndicator(null);
    setContent(null);
    setUserChoice(null);
    setResult(null);
    setShowAnalysis(false);
  };

  const goToSelection = (mode: AppMode) => {
    setAppMode(mode);
    setStep('selection');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 group transition-all">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Mentor Financiero AI</h1>
          </button>
          
          {appMode !== 'home' && (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                {appMode === 'corporativas' ? 'Corporativas' : 'Personales'}
              </span>
              <button 
                onClick={reset}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {appMode === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-12"
            >
              <div className="text-center space-y-6 max-w-2xl mx-auto pt-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/10 mb-8"
                >
                  <Trophy className="w-10 h-10" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  Domina tus <span className="text-blue-600">Finanzas</span>.
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed">
                  Un mentor interactivo diseñado para fortalecer tu capacidad de análisis empresarial y personal de forma práctica.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <button
                  onClick={() => goToSelection('corporativas')}
                  className="group relative p-8 bg-white border border-slate-200 rounded-[2.5rem] text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col gap-6"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Corporativas</h2>
                    <p className="text-slate-500 mt-2 leading-relaxed">Aprende a dirigir empresas, analizar balances y tomar decisiones gerenciales estratégicas.</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold">
                    Empezar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => goToSelection('personales')}
                  className="group relative p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] text-left hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-950/20 transition-all flex flex-col gap-6"
                >
                  <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    <Coins className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Personales</h2>
                    <p className="text-slate-400 mt-2 leading-relaxed">Domina tus ahorros, controla tus deudas y entiende cómo funciona el dinero en tu día a día.</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-400 font-bold">
                    Mejorar ahora <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Learning Impact Panel */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-10 overflow-hidden relative shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="relative z-10 space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rendimiento Académico</h3>
                      <p className="text-slate-500 text-sm">Visualización del progreso y práctica real.</p>
                    </div>
                    <div className="bg-blue-600 px-4 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Progreso Real
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-black text-slate-900">{stats.challenges.toLocaleString()}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Casos Resueltos</div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-black text-green-500">{stats.correct.toLocaleString()}</div>
                      <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">Aciertos</div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-black text-blue-600">
                        {stats.challenges > 0 ? Math.round((stats.correct / stats.challenges) * 100) : 0}%
                      </div>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Rendimiento Técnico</div>
                    </div>
                  </div>

                  {stats.challenges > 0 && (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Rendimiento Chart */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">Análisis de Resultados</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RePieChart>
                                <Pie
                                  data={[
                                    { name: 'Correctos', value: stats.correct },
                                    { name: 'Incorrectos', value: stats.incorrect }
                                  ]}
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  <Cell fill="#22c55e" />
                                  <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                              </RePieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                              Correctas
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full" />
                              Incorrectas
                            </div>
                          </div>
                        </div>

                        {/* Indicadores Chart */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">Tópicos más practicados</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={Object.entries(stats.mostStudied)
                                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                                  .slice(0, 5)
                                  .map(([id, count]) => ({
                                    name: INDICATORS.find(i => i.id === id)?.acronym || id,
                                    count
                                  }))
                                }
                                layout="vertical"
                                margin={{ left: -20 }}
                              >
                                <XAxis type="number" hide />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  axisLine={false} 
                                  tickLine={false}
                                  width={60}
                                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    fontSize: '12px'
                                  }} 
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                  {Object.entries(stats.mostStudied).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#94a3b8'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tendencia Académica</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.mostStudied)
                              .sort((a, b) => (b[1] as number) - (a[1] as number))
                              .slice(0, 3)
                              .map(([id]) => (
                                  <span key={id} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold ring-1 ring-blue-100">
                                    {INDICATORS.find(i => i.id === id)?.name || id}
                                  </span>
                              ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Foco de Atención</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.commonErrors)
                              .sort((a, b) => (b[1] as number) - (a[1] as number))
                              .slice(0, 1)
                              .map(([cat]) => (
                                  <span key={cat} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold ring-1 ring-red-100">
                                    {cat}
                                  </span>
                              ))}
                            {Object.keys(stats.commonErrors).length === 0 && (
                              <span className="text-xs text-slate-400 italic">Analizando patrones...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {appMode !== 'home' && step === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 mb-10 max-w-xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                  {appMode === 'corporativas' ? 'Elige una métrica estratégica' : 'Entiende cómo fluye tu dinero'}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  {appMode === 'corporativas' 
                    ? 'Analiza el desempeño de una empresa desde diferentes perspectivas.' 
                    : 'Aprende los conceptos clave para mantener tus finanzas personales sanas.'}
                </p>
              </div>

              <div className="space-y-16">
                {(appMode === 'corporativas' ? CATEGORIES.filter(c => c !== 'Personal') : ['Personal']).map(category => (
                  <div key={category} className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                      <div className="h-[2px] w-8 bg-blue-500/20" />
                      {category}
                      <div className="h-[2px] flex-grow bg-blue-500/10" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {INDICATORS.filter(i => i.category === category && i.mode === appMode).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => startCycle(item.id)}
                          disabled={loading}
                          className="group p-8 text-left bg-white border border-slate-100 rounded-[2rem] hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/5 transition-all text-balance active:scale-[0.98] flex flex-col items-start gap-4"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-black text-sm tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                              {item.acronym}
                            </span>
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-lg text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium opacity-80">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="max-w-2xl mx-auto pt-10">
                  <button
                    onClick={() => startCycle('Aleatorio')}
                    disabled={loading}
                    className="w-full relative group overflow-hidden p-1 bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 rounded-[2.5rem] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="bg-slate-950 p-10 rounded-[2.3rem] flex flex-col md:flex-row items-center gap-8 text-left">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                        <RefreshCcw className="w-8 h-8 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-2xl text-white tracking-tight">Reto Aleatorio</h3>
                        <p className="text-slate-400 text-base leading-relaxed">Deja que el Mentor elija un concepto para poner a prueba tu capacidad de análisis.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'translation' && (
            <motion.div 
              key="translation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
                
                <div className="space-y-10 relative z-10 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-[0.2em] shadow-sm">
                         Módulo 1: Traducción
                      </div>
                      <div className="space-y-1">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                          {indicator?.acronym}
                        </h1>
                        <h2 className="text-xl font-bold text-slate-500 uppercase tracking-wide">
                          {content?.translation || indicator?.name}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="hidden lg:block p-3 bg-slate-50 rounded-2xl">
                      <PieChart className="w-12 h-12 text-blue-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <ArrowRightLeft className="w-3 h-3" />
                        Analogía Simple
                      </h4>
                      <p className="text-lg text-slate-700 leading-relaxed italic font-medium">
                        "{content?.analogy}"
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilidad</h4>
                        <p className="text-sm font-bold text-slate-900 leading-snug">{content?.utility}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Error Común</h4>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{content?.commonError}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-6 bg-blue-600 text-white text-lg font-black rounded-3xl hover:bg-slate-900 transition-all hover:shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98] mt-4"
                  >
                    Siguiente: Entender en la práctica
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'simulation' && (
            <motion.div 
              key="simulation"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest">
                    Módulo 2: Simulación
                  </div>
                </div>
                
                <div className="p-6 bg-yellow-50 rounded-[2rem] border border-yellow-100 flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Mentor Tip</h5>
                    <p className="text-sm font-bold text-yellow-900 leading-relaxed">
                      {content?.microExplanation}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Escenario de Cambio</h4>
                    <p className="text-xl font-bold leading-relaxed">{content?.scenario}</p>
                  </div>
                  
                  <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Efecto en Cascada</h4>
                    <p className="text-slate-700 font-medium leading-relaxed italic">
                      {content?.effect}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full py-6 bg-slate-950 text-white text-lg font-black rounded-3xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-2xl shadow-slate-900/30"
                >
                  Continuar al Reto Final
                </button>
              </div>
            </motion.div>
          )}

          {step === 'challenge' && (
            <motion.div 
              key="challenge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-10">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                    Reto de Decisión
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Caso Práctico: {indicator?.acronym}</h3>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3 text-blue-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold leading-relaxed">{content?.microExplanation}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-slate-500 font-medium leading-relaxed">{content?.context}</p>
                    <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] text-center">
                      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">El Dilema</h4>
                      <p className="text-2xl font-black text-red-900 leading-tight">
                        {content?.dilema}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(content?.options || {}).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleDecision(key)}
                      className="group p-6 text-left bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-600 hover:bg-blue-50 hover:-translate-y-1 transition-all flex items-start gap-4"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        {key}
                      </div>
                      <span className="text-slate-800 font-bold group-hover:text-blue-900 transition-colors pt-2 leading-relaxed">{value as string}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              {!showAnalysis ? (
                <div className={`p-12 rounded-[4rem] border border-slate-100 shadow-2xl text-center space-y-8 relative overflow-hidden ${
                  result?.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className={`mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 ${
                    result?.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {result?.isCorrect ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                  </div>

                  <div className="space-y-4">
                    <h3 className={`text-3xl font-black tracking-tight ${result?.isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                      {result?.isCorrect ? '¡Decisión Correcta!' : 'Decisión con Diferente Riesgo'}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed max-w-sm mx-auto text-sm">
                      {result?.isCorrect 
                        ? 'Has aplicado una visión estratégica excelente en este caso financiero.' 
                        : 'Tu elección tiene implicaciones que impactan el resultado de forma distinta.'}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opción Correcta</h4>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {content?.options[content.correct]}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAnalysis(true)}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    Analizar decisión
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10"
                >
                  <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      Análisis Pedagógico
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">Lección del Mentor</h3>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">¿Qué evaluamos en este caso?</h4>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{result?.whatEvaluated}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Lógica de la decisión correcta</h4>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 font-medium leading-relaxed">
                        "{result?.feedbackDetail}"
                      </div>
                    </div>

                    <p className="text-center text-slate-500 text-sm font-medium">
                      El objetivo es conectar la teoría con la práctica para fortalecer tu pensamiento estratégico.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t border-slate-50">
                    <button
                      onClick={() => startCycle(indicator?.id || '')}
                      className="py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm"
                    >
                      Seguir con {indicator?.acronym}
                    </button>
                    <button
                      onClick={() => startCycle('Aleatorio')}
                      className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all text-sm"
                    >
                      Reto Aleatorio
                    </button>
                    <button
                      onClick={reset}
                      className="py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all text-sm"
                    >
                      Inicio
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Loading Layout */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[10px]" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center gap-8 relative z-10"
            >
              <div className="relative">
                <div className="w-20 h-20 border-[6px] border-slate-100 rounded-full" />
                <div className="w-20 h-20 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
              </div>
              <div className="text-center space-y-2">
                <h6 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Preparando Conexión</h6>
                <p className="text-xs text-slate-400 font-bold max-w-[200px]">El Mentor está estructurando el conocimiento para tu aprendizaje.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
