import { create } from 'zustand'
import useDateStore from './useDateStore'
import { useSettingsStore } from './settingsStore'
import { MessageType } from '../interfaces/message.interface'

type State = {
    messageType: MessageType | null
    messageText: string
    isMessageOpen: boolean
}

type Action = {
    showMessage: (type: MessageType, text: string) => void
    hideMessage: () => void
}

const useMessage = create<State & Action>((set) => ({
    messageType: null,
    messageText: '',
    isMessageOpen: false, // Tip: Generalmente debería iniciar en false
    showMessage: (type: MessageType, text: string) => {
      
        useDateStore.getState().setIsDateSelectorOpen(false);
        useSettingsStore.getState().setIsAddOptionsOpen(false);

        set(() => ({
            messageType: type,
            messageText: text,
            isMessageOpen: true
        }));
    },
    hideMessage: () => set(() => ({
        isMessageOpen: false,
        messageType: null,
        messageText: ''
    }))
}))

export default useMessage