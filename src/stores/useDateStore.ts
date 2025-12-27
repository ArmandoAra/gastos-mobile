import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================
// TIPOS
// ============================================

type DateState = {
    selectedYear: number
    selectedMonth: number
    selectedDay: number
    isDateSelectorOpen: boolean
    // Eliminamos _hasHydrated porque ya no hay persistencia que esperar
}

type Actions = {
    setSelectedYear: (year: number) => void
    setSelectedMonth: (month: number) => void
    setSelectedDay: (day: number) => void
    setIsDateSelectorOpen: (isOpen: boolean) => void
    setCurrentDate: () => void
    resetDateFilters: () => void
    // Eliminamos setHasHydrated
}

// ============================================
// VALORES INICIALES
// ============================================

const initialState: DateState = {
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedDay: new Date().getDate(),
    isDateSelectorOpen: false,
}

// ============================================
// STORE (En Memoria / Sin Persistencia)
// ============================================

const useDateStore = create<DateState & Actions>()(
    devtools(
        (set) => ({
            ...initialState,

            setSelectedYear: (year: number) => {
                set({ selectedYear: year }, false, 'setSelectedYear')
            },

            setSelectedMonth: (month: number) => {
                if (month < 0 || month > 12) return
                set({ selectedMonth: month }, false, 'setSelectedMonth')
            },

            setSelectedDay: (day: number) => {
                set({ selectedDay: day }, false, 'setSelectedDay')
            },

            setIsDateSelectorOpen: (isOpen: boolean) => {
                set({ isDateSelectorOpen: isOpen }, false, 'setIsDateSelectorOpen')
            },

            setCurrentDate: () => {
                const now = new Date()
                set({
                    selectedYear: now.getFullYear(),
                    selectedMonth: now.getMonth() + 1,
                    selectedDay: now.getDate(),
                }, false, 'setCurrentDate')
            },

            resetDateFilters: () => {
                set({ isDateSelectorOpen: false }, false, 'resetDateFilters')
            },
        }),
        { name: 'DateStore' }
    )
)

export default useDateStore;