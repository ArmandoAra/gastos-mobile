// ============================================
// CATEGORY PIE CHART COMPONENT
// ============================================
import { Dimensions, View } from 'react-native';
import { VictoryPie } from 'victory';
import { StyleSheet } from 'react-native';

interface CategoryPieChartProps {
    data: Array<{ x: string; y: number; label?: string }>;
    height?: number;
    width?: number;
}
const { width } = Dimensions.get('window');


export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
    data,
    height = 280,
    width: chartWidth = width - 64,
}) => {
    return (
        <View style={categoryPieChartStyles.container}>
            <VictoryPie
                data={data}
                height={height}
                width={chartWidth}
                colorScale={[
                    '#EF5350',
                    '#42A5F5',
                    '#66BB6A',
                    '#FFA726',
                    '#AB47BC',
                    '#26C6DA',
                    '#FF7043',
                    '#8D6E63',
                ]}
                labelRadius={({ innerRadius }) => (typeof innerRadius === 'number' ? innerRadius : 60) + 35}
                style={{
                    labels: {
                        fontSize: 11,
                        fill: 'white',
                        fontWeight: 'bold',
                    },
                }}
                innerRadius={60}
            />
        </View>
    );
};

const categoryPieChartStyles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        alignItems: 'center',
    },
});