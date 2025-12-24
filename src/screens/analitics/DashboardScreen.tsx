import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';

// 1. IMPORTACIONES DE VICTORY NATIVE XL (SKIA)
import { 
  CartesianChart, 
  Bar, 
  Line,
  useChartPressState
} from "victory-native";

// 2. IMPORTACIONES DE SKIA (Necesario para fuentes y colores)
import { useFont, Circle, vec } from "@shopify/react-native-skia";

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfYear, 
  endOfYear 
} from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

// ============================================
// MOCK DATA
// ============================================
const MOCK_TRANSACTIONS = [
  { id: '1', description: 'Supermercado', amount: 450.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-20T10:30:00', account_id: '1' },
  { id: '2', description: 'Salario', amount: 8500.00, type: 'income', category_name: 'Salario', date: '2024-12-15T09:00:00', account_id: '1' },
  { id: '3', description: 'Netflix', amount: 55.90, type: 'expense', category_name: 'Entretenimiento', date: '2024-12-18T14:20:00', account_id: '1' },
  { id: '4', description: 'Gasolina', amount: 320.00, type: 'expense', category_name: 'Transporte', date: '2024-12-19T08:15:00', account_id: '1' },
  { id: '5', description: 'Freelance', amount: 2500.00, type: 'income', category_name: 'Extra', date: '2024-12-17T16:00:00', account_id: '2' },
  { id: '6', description: 'Restaurante', amount: 180.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-21T19:30:00', account_id: '3' },
  { id: '7', description: 'Farmacia', amount: 95.00, type: 'expense', category_name: 'Salud', date: '2024-12-16T11:00:00', account_id: '1' },
  { id: '8', description: 'Gimnasio', amount: 150.00, type: 'expense', category_name: 'Salud', date: '2024-12-01T07:00:00', account_id: '1' },
  { id: '9', description: 'Café', amount: 45.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-22T08:30:00', account_id: '3' },
  { id: '10', description: 'Uber', amount: 35.50, type: 'expense', category_name: 'Transporte', date: '2024-12-22T18:00:00', account_id: '1' },
  { id: '11', description: 'Compras', amount: 890.00, type: 'expense', category_name: 'Compras', date: '2024-12-14T15:30:00', account_id: '1' },
];

// Colores para el gráfico de torta
const CATEGORY_COLORS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

export default function DashboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
 
  const font = useFont(require("../../../assets/fonts/Quicksand-Regular.ttf"), 12) || null; 


  // ============================================
  // LÓGICA DE DATOS (Igual que antes)
  // ============================================
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start, end;

    switch (selectedPeriod) {
      case 'week':
        start = startOfWeek(now, { locale: es });
        end = endOfWeek(now, { locale: es });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return MOCK_TRANSACTIONS.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });
  }, [selectedPeriod]);

  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const income = filteredTransactions.filter(t => t.type === 'income');

  // Preparar datos para Pie Chart (formato específico para Victory XL)
  const expensesPieData = useMemo(() => {
    const groups: Record<string, number> = {};
    expenses.forEach(t => {
      if (!groups[t.category_name]) groups[t.category_name] = 0;
      groups[t.category_name] += t.amount;
    });
    
    return Object.entries(groups)
      .map(([label, value], index) => ({
        label,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Preparar datos para Bar Chart
  const dailyExpenses = useMemo(() => {
    const days = [];
    const dayCount = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 6;
    
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date();
      if(selectedPeriod === 'year') {
         // Lógica simplificada para año (últimos 6 meses)
         date.setMonth(date.getMonth() - i);
         const monthStr = format(date, 'MMM', { locale: es });
         // Suma dummy o real
         days.push({ x: monthStr, y: Math.random() * 500 + 100 }); 
      } else {
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayLabel = format(date, 'd/MM');
        
        const dayTotal = expenses
          .filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        days.push({ x: dayLabel, y: dayTotal });
      }
    }
    return days;
  }, [expenses, selectedPeriod]);

  // Preparar datos para Line Chart
  const trendData = useMemo(() => {
     // Generamos datos dummy para que se vea la línea si no hay suficientes transacciones
     return [
       { x: 'Ene', y: 1200 }, { x: 'Feb', y: 900 }, { x: 'Mar', y: 1500 },
       { x: 'Abr', y: 800 }, { x: 'May', y: 1100 }, { x: 'Jun', y: 1300 }
     ];
  }, []);

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses
    };
  }, [expenses, income]);

  // Interaction State (Hook necesario para tooltips en el futuro)
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  return (
    <ScrollView style={styles.container}>
      {/* Selector de Periodo */}
      <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map((p) => (
          <TouchableOpacity 
            key={p}
            style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
            onPress={() => setSelectedPeriod(p as any)}
          >
            <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumen */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={[styles.balanceAmount, { color: stats.balance >= 0 ? '#4CAF50' : '#EF5350' }]}>
          ${stats.balance.toLocaleString('es-AR')}
        </Text>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceItemLabel}>Ingresos</Text>
            <Text style={{color: '#4CAF50', fontWeight:'bold'}}>${stats.totalIncome}</Text>
          </View>
          <View>
            <Text style={styles.balanceItemLabel}>Gastos</Text>
            <Text style={{color: '#EF5350', fontWeight:'bold'}}>${stats.totalExpenses}</Text>
          </View>
        </View>
      </View>

      {/* 1. GRÁFICO DE BARRAS (CartesianChart + Bar) */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 Gastos Diarios</Text>
        <View style={{ height: 250, width: '100%' }}>
            <CartesianChart
              data={dailyExpenses}
              xKey="x"
              yKeys={["y"]}
              // Configuración de Ejes (requiere font)
              axisOptions={{
                font, 
                tickCount: 5,
                lineColor: "#e0e0e0",
                labelColor: "#757575",
              }}
              // Espaciado interno para que no se corten las barras
              domainPadding={{ left: 20, right: 20, top: 30 }}
            >
              {({ points, chartBounds }) => (
                // Renderizamos las barras usando los puntos calculados por el chart
                <Bar
                  points={points.y}
                  chartBounds={chartBounds}
                  color="#6200EE"
                  roundedCorners={{ topLeft: 5, topRight: 5 }}
                  // Espaciado entre barras
                  innerPadding={0.5} 
                />
              )}
            </CartesianChart>
        </View>
      </View>

      {/* 2. GRÁFICO DE TORTA - Usando leyenda visual con barras */}
      {expensesPieData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>🎯 Categorías</Text>
          <View style={{ height: 300, justifyContent: 'center', paddingVertical: 20 }}>
            {expensesPieData.map((item, index) => {
              const total = expensesPieData.reduce((sum, d) => sum + d.value, 0);
              const percentage = ((item.value / total) * 100).toFixed(1);
              
              return (
                <View key={index} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500' }}>{item.label}</Text>
                    <Text style={{ fontSize: 14, color: '#757575' }}>${item.value.toFixed(2)} ({percentage}%)</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                    <View 
                    style={{ 
                      height: '100%', 
                      backgroundColor: item.color,
                      borderRadius: 4 
                    }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 3. GRÁFICO DE LÍNEA (CartesianChart + Line) */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Tendencia</Text>
        <View style={{ height: 250, width: '100%' }}>
            <CartesianChart
              data={trendData}
              xKey="x"
              yKeys={["y"]}
              axisOptions={{
                font,
                lineColor: "#e0e0e0",
              }}
              domainPadding={{ top: 30, bottom: 30 }}
            >
              {({ points, chartBounds }) => (
                <>
                  <Line
                    points={points.y}
                    color="#FF6B6B"
                    strokeWidth={3}
                    curveType="natural" // Curva suave
                  />
                  {/* Opcional: Puntos en cada dato */}
                  {/* <Scatter points={points.y} shape="circle" radius={4} style="fill" color="#FF6B6B" /> */}
                </>
              )}
            </CartesianChart>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  periodSelector: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: 'white' },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#6200EE' },
  periodText: { color: '#757575', fontWeight: '600' },
  periodTextActive: { color: 'white' },
  balanceCard: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 16, elevation: 2 },
  balanceLabel: { color: '#757575', marginBottom: 8 },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 16, justifyContent:'space-between' },
  balanceItemLabel: { fontSize: 12, color: '#757575' },
  chartContainer: { backgroundColor: 'white', margin: 16, marginTop: 0, padding: 16, borderRadius: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});