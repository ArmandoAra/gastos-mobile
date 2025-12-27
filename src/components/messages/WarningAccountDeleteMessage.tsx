'use client';

import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { fieldVariants } from "@/app/dashboard/components/forms/styles";
import useDataStore from "@/app/store/useDataStore";
import AccountSelector from "@/app/dashboard/components/forms/Inputs/AccoutSelector";
import { TransactionType } from "@/app/actions/localData/interfaces";
import useDateStore from "@/app/store/useDateStore";
import { deleteAccount } from "@/app/actions/db/Accounts_API";
import { getMonthTransactions, transferTransactionsAccount } from "@/app/actions/db/Gastos_API";

const toastVariants = {
    hidden: {
        opacity: 0,
        y: -100,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 20,
            duration: 0.5,
        }
    },
    exit: {
        opacity: 0,
        y: -100,
        scale: 0.8,
        transition: {
            duration: 0.3,
            ease: "easeInOut" as const,
        }
    }
};

const iconVariants = {
    hidden: {
        scale: 0,
        rotate: -180,
    },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            delay: 0.2,
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
        }
    }
};

const textIntroVariants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.2,
            duration: 0.1,
            ease: "easeInOut" as const,
        }
    },
    exit: {
        opacity: 0,
        y: 10,
        transition: {
            duration: 0.21,
            ease: "easeInOut" as const,
        }
    }
};

const InfoText = () => (
    <motion.div 
        variants={textIntroVariants}
         initial="hidden"
                animate="visible"
                exit="exit"
    >
    <Typography
        variant="body1"
        sx={{
            width: '100%',
            color: 'rgba(255, 69, 58, 0.9)',
            fontSize: '1rem',   
            textAlign: 'center',
            mt: 1,
        }}
    >
        Please select an account to transfer the transactions to.
    </Typography>
    </motion.div>
);


const backgroundVariant = {
    background: 'linear-gradient(135deg, rgba(9, 26, 28, 0.9) 0%, rgba(13, 68, 68, 0.7)100%)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)',
    overflow: 'hidden',
    position: 'relative',
}

interface WarningAccountDeleteMessageProps {
    accountToDelete: string;
    message: string;
    onClose: () => void;
    // onSubmit: (e: React.MouseEvent, account_id: string) => void;
}

export default function WarningAccountDeleteMessage({
    accountToDelete,
    message,
    onClose,
}: WarningAccountDeleteMessageProps) {
    const { allAccounts, setSelectedAccount, setTransactions, deleteAccountStore, updateAccountBalance } = useDataStore();
    const { selectedYear, selectedMonth } = useDateStore();
    const [toNewAccount, setToNewAccount] = useState<string>(accountToDelete || '');
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const onDeleteAnyWay = (e: React.MouseEvent) => {

        // Chequear que no sea la unica cuenta existente
        if(allAccounts.length <= 1) {
            return;
        }
        // Eliminar la cuenta directamente
        deleteAccount(accountToDelete).then(deleted => {
            if(!deleted) {
                console.error("Error deleting the account.");
                return;
            }   

            // Borrar la cuenta del store
            deleteAccountStore(accountToDelete);
            
        });  
        setSelectedAccount(allAccounts[0]?.id || '');

            // Limpiamos las transactions del store
            setTransactions([]);
            // Volver a cargar las transactions del mes seleccionado
        getMonthTransactions(selectedYear, selectedMonth).then(monthTransactions => {
                // Setear las transactions en el store
               setTransactions(monthTransactions || []);
              });
        onClose();
    }

    const onTransferAndDelete = async (e: React.MouseEvent) => {
        // Verificar que se haya seleccionado una cuenta diferente
        if(toNewAccount === '' || toNewAccount === accountToDelete) {
            setShowInfo(true);
            return;
        };

        //Chequear que no sea la unica cuenta existente
        // Esto no deberi llegar aqui porque no habilitamos el boton si es la unica cuenta
        if(allAccounts.length <= 1) {
            return;
        }

        // Obtener todas las transactions asociadas a esta cuenta, directamente del backend para tener todos los datos
        try {
            // enviar las dos cuentas al backend para que haga el cambio
            const response = await transferTransactionsAccount(accountToDelete, toNewAccount);
            if(response === null) {
                console.error("Error fetching transactions for account deletion.");
                return;
            }
            if(!response.ok) {
                console.error("Error transferring transactions to new account.");
                return;
            }
            // Si todo sale bien, eliminar la cuenta vieja
            const deleted = await deleteAccount(accountToDelete).then(deleted => {
                if(!deleted) {
                    console.error("Error deleting the old account after transfer.");
                    return false;
                } 
                return true;
            });
            
            if(!deleted) {
                console.error("Error deleting the old account after transfer.");
                return;
            }
            // Setear la nueva cuenta seleccionada
            setSelectedAccount(toNewAccount);
            // Actualizamos el account seleccionado para transferir las transactions
            if(response.totalImpact) {
                const amountImpacted: number = response.totalImpact;
                const acctionByTransactionType = amountImpacted > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
                updateAccountBalance(toNewAccount, amountImpacted, acctionByTransactionType); // Actualizamos el balance de la nueva cuenta (0 porque no sabemos el monto exacto transferido)
            }

            // Borrar la cuenta del store
            deleteAccount(accountToDelete);


            // Limpiamos las transactions del store
            setTransactions([]);

            // Volver a cargar las transactions del mes seleccionado
            const monthTransactions = await getMonthTransactions(selectedYear, selectedMonth);
            // Setear las transactions en el store
           setTransactions(monthTransactions || []);
           onClose();  

           
            
        } catch (error) {
            console.error("Error during transfer and delete:", error);
            return;
        }

    }


    return (
        <AnimatePresence mode="wait">
            <motion.div
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                    position: 'absolute',
                    margin: '0 auto',
                    transform: 'translateX(-50%)',
                    zIndex: 400,
                    minWidth: '500px',
                    maxWidth: '500px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid rgba(215, 35, 35, 0.9)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Box
                    sx={backgroundVariant}
                >
                    {/* Contenido del toast */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        position: 'relative',
                        zIndex: 1,
                    }}>


                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: '1.7rem',
                                    mb: 0.5,
                                    textAlign: 'center'
                                }}
                            >
                                Warning 
                            </Typography>
                                <span className="text-md  mx-auto text-red-500">Account: {allAccounts.find(acc => acc.id === accountToDelete)?.name}</span>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '1.275rem',
                                    textAlign: 'center'
                                }}
                            >
                                {message}
                            </Typography>
                        </Box>

                    </Box>
                    <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>

                                < AccountSelector 
                                        label="Select Account"
                                        accountSelected={toNewAccount}
                                        setAccountSelected={setToNewAccount}
                                        accounts={allAccounts}
                                />
                    </Box>
                    {showInfo && <InfoText />}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        gap: 2,
                        p: 2.5,
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        <motion.div
                            variants={fieldVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ width: '45%' }}
                        >
                            {/* Mensaje de información para no seleccionar la misma cuenta */}
                            <Box
                                onClick={onTransferAndDelete}
                                sx={{
                                    width: '100%',
                                    py: 2,
                                    px: 3,
                                    background: (toNewAccount === accountToDelete || toNewAccount === '') ? 'gray' : `linear-gradient(135deg, #14b8a6 0%, #10b981 100%)`,
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    cursor: (toNewAccount === accountToDelete || toNewAccount === '') ? 'not-allowed' : 'pointer',
                                    '&:hover': {
                                        background: `linear-gradient(135deg,  0%, ${['#14b8a6', '#10b981']} 100%)`,
                                        rotate: '1deg',
                                    },
                                }}
                            >
                                Transfer & Delete 
                            </Box>
                        </motion.div>
                        <motion.div
                            variants={fieldVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ width: '45%' }}
                        >
                            <Box
                                onClick={(e) => onDeleteAnyWay(e)}
                                sx={{
                                    width: '100%',
                                    py: 2,
                                    px: 3,
                                    background: `linear-gradient(135deg, #ef4444 0%, #f87171 100%)`,
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                Delete Anyway
                            </Box>

                        </motion.div>
                    </Box>
                    {/* Decoración de fondo */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            filter: 'blur(20px)',
                        }}
                    />
                </Box>
            </motion.div>
        </AnimatePresence>
    );
}

