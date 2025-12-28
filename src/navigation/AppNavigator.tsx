import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Importaciones con llaves (Named Imports)
import { HomeScreen } from "../screens/home/HomeScreen";
import { DashboardScreen } from "../screens/analitics/AnaliticsScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsListScreen";

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused }) => {
                        const icons: Record<string, string> = {
                            Inicio: '🏠',
                            Transacciones: '💳',
                            Dashboard: '📊',
                        };
                        return (
                            <Text style={{ fontSize: focused ? 24 : 20 }}>
                                {icons[route.name]}
                            </Text>
                        );
                    },
                    tabBarActiveTintColor: '#6200EE',
                    tabBarInactiveTintColor: 'gray',
                    headerStyle: { backgroundColor: '#6200EE' },
                    headerTintColor: '#fff',
                })}
            >
                <Tab.Screen name="Inicio" component={HomeScreen} />
                <Tab.Screen name="Transacciones" component={TransactionsScreen} />
                <Tab.Screen name="Dashboard" component={DashboardScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}