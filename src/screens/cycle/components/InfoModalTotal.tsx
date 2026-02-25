import React from 'react'; // <-- Añadido useState
import { View, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native'; // <-- Añadidos Modal y TouchableWithoutFeedback
import { Icon, Text } from 'react-native-paper'; // Quitamos Tooltip
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { globalStyles } from '../../../theme/global.styles';
import { t } from 'i18next';

import {RedStar, StarIcon} from '../../../constants/icons';
import { BlueStar } from '../../../constants/icons';
import { YellowStar } from '../../../constants/icons';
import { useSettingsStore } from '../../../stores/settingsStore';

interface Props {
    isHelpVisible: boolean;
    setIsHelpVisible: (visible: boolean) => void;
    colors: any;
}

export function InfoModalTotal({ isHelpVisible, setIsHelpVisible, colors}: Props) {
  const iconsOptions = useSettingsStore((state) => state.iconsOptions);

  return (
    <Modal
            visible={isHelpVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsHelpVisible(false)} // Para botón físico 'Atrás' en Android
          >
            {/* Este TouchableOpacity cubre toda la pantalla y cierra el modal si tocas fuera */}
            <TouchableOpacity
              style={[styles.modalOverlay, { backgroundColor: colors.background }]}
              activeOpacity={1}
              onPressOut={() => setIsHelpVisible(false)}
            >
              {/* Este TouchableWithoutFeedback evita que tocar la "burbuja" cierre el modal */}
              <TouchableWithoutFeedback>
                <View style={[styles.modalBubble, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
    
                  <Animated.View style={styles.modalItem} entering={FadeInLeft.delay(100)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      {iconsOptions === 'painted' ? <RedStar size={22}/> : <StarIcon size={22} color={colors.expense}/>}
                      <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{`${t('cycle_screen.rollover')}`}</Text>
                    </View>
                    <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{t('cycle_screen.rollover_sub')}</Text>
                  </Animated.View>

                   <Animated.View style={styles.modalItem} entering={FadeInLeft.delay(200)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      {iconsOptions === 'painted' ? <BlueStar size={22}/> : <StarIcon size={22} color={colors.accent}/>}
                      <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{`${t('cycle_screen.buffer')}`}</Text>
                    </View>
                    <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{t('cycle_screen.buffer_sub')}</Text>
                  </Animated.View>
    
                  <Animated.View style={styles.modalItem} entering={FadeInLeft.delay(300)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>  
                      {iconsOptions === 'painted' ? <YellowStar size={22}/> : <StarIcon size={22} color={colors.warning}/>}
                      <Text style={[globalStyles.bodyTextLg, { color: colors.text }]}>{`${t('cycle_screen.avg_per_cycle')}`}</Text>
                    </View>
                    <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{t('cycle_screen.avg_per_day_sub')}</Text>
                  </Animated.View>
    
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
  )
}

const styles = StyleSheet.create({
    modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBubble: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalItemDesc: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  }
});

