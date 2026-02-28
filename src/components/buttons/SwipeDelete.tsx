import Animated from 'react-native-reanimated'
import { StyleSheet, View, ViewStyle } from 'react-native'


import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'

interface SwipeDeleteProps {
    rBackgroundStyle: {
    backgroundColor: string;
    justifyContent: "flex-start" | "flex-end";
},
    colors: {
        surface: string;
    }
}

export const SwipeDelete = ({ rBackgroundStyle, colors }: SwipeDeleteProps) => {
  return (
    <Animated.View
                style={[StyleSheet.absoluteFill, styles.backgroundContainer, rBackgroundStyle]}
                importantForAccessibility="no"
            >
                <View style={[styles.deleteIconContainer, { left: 20 }]}>
                    <View style={styles.deleteIconCircle}>
                        <MaterialIcons name="delete" size={20} color={colors.surface} />
                    </View>
                </View>
                <View style={[styles.deleteIconContainer, { right: 20 }]}>
                    <View style={styles.deleteIconCircle}>
                        <MaterialIcons name="delete" size={20} color={colors.surface} />
                    </View>
                </View>
                
            </Animated.View>
  )
}

const styles = StyleSheet.create({
        backgroundContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FC8181',
    },
    deleteIconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    deleteIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
