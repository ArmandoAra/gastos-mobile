// ============================================
// STYLES
// ============================================
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 6,
  },
  
  // Accounts List
  totalCard: {
    backgroundColor: '#6200EE',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  accountsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontFamily: 'FiraSans-Bold',
    color: '#000',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 13,
    color: '#757575',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  accountBalanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#6200EE',
  },
  typeBtnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeBtnText: {
    fontSize: 12,
    fontFamily: 'FiraSans-Bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalBtnConfirm: {
    backgroundColor: '#6200EE',
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: 'FiraSans-Bold',
  },

  // Settings
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#424242',
  },
  settingValue: {
    fontSize: 16,
    color: '#757575',
  },
  checkmark: {
    fontSize: 20,
    color: '#6200EE',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  themeBtnActive: {
    backgroundColor: '#6200EE',
  },
  themeBtnText: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6200EE',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  logoutBtn: {
    backgroundColor: '#EF5350',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Auth
  authContainer: {
    flex: 1,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    padding: 24,
  },
  authContent: {
    alignItems: 'center',
  },
  authLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  authForm: {
    width: '100%',
  },
  authInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  authButton: {
    backgroundColor: '#03DAC6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  authLinkText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  authDividerText: {
    color: 'rgba(255,255,255,0.8)',
    marginHorizontal: 16,
  },
  authButtonSecondary: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  authButtonSecondaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // PIN Screen
  pinContainer: {
    flex: 1,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pinTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  pinDotFilled: {
    backgroundColor: 'white',
  },
  pinError: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 20,
  },
  pinKeypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    justifyContent: 'center',
    marginTop: 20,
  },
  pinKey: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pinKeyText: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'FiraSans-Bold',
  },
  pinBiometric: {
    marginTop: 40,
    padding: 16,
  },
  pinBiometricText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },

  // Add Transaction
  typeToggle: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  typeToggleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  typeToggleBtnExpense: {
    backgroundColor: '#EF5350',
  },
  typeToggleBtnIncome: {
    backgroundColor: '#4CAF50',
  },
  typeToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200EE',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 150,
  },
  formGroup: {
    margin: 16,
    marginTop: 0,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'FiraSans-Bold',
    color: '#424242',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#424242',
  },
  categoryChipTextActive: {
    color: 'white',
    fontFamily: 'FiraSans-Bold',
  },
  accountSelector: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountSelectorText: {
    fontSize: 16,
    color: '#424242',
  },
  saveButton: {
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});