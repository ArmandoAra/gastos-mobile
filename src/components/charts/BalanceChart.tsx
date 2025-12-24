// ============================================
// BALANCE CHART COMPONENT
// ============================================
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory';
import { Dimensions, View } from 'react-native';
import { StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

interface BalanceChartProps {
    data: Array<{ x: string; y: number }>;
    height?: number;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data, height = 220 }) => {
    return (
        <View style={balanceChartStyles.container}>
            <VictoryChart
                theme={VictoryTheme.material}
                height={height}
                width={width - 64}
                domainPadding={{ x: 20 }}
            >
                <VictoryAxis
                    style={{
                        tickLabels: { fontSize: 10, padding: 5 },
                        grid: { stroke: 'transparent' },
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    style={{
                        tickLabels: { fontSize: 9 },
                        grid: { stroke: '#e0e0e0', strokeDasharray: '4,4' },
                    }}
                />
                <VictoryBar
                    data={data}
                    style={{
                        data: {
                            fill: ({ datum }) => (datum.y > 0 ? '#6200EE' : '#E0E0E0'),
                            fillOpacity: 0.9,
                        },
                    }}
                    cornerRadius={{ top: 6 }}
                    barWidth={20}
                />
            </VictoryChart>
        </View>
    );
};

const balanceChartStyles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
    },
});