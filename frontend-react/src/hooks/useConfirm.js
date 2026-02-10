import { useState, useCallback } from 'react';

export function useConfirm() {
    const [state, setState] = useState({
        isOpen: false,
        resolve: null,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        confirmVariant: 'primary'
    });

    const confirm = useCallback((title, message, options = {}) => {
        return new Promise(resolve => {
            setState({
                isOpen: true,
                resolve,
                title,
                message,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                confirmVariant: options.confirmVariant || 'primary'
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState(s => ({ ...s, isOpen: false }));
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState(s => ({ ...s, isOpen: false }));
    }, [state.resolve]);

    const modalProps = {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        confirmVariant: state.confirmVariant,
        onConfirm: handleConfirm,
        onCancel: handleCancel
    };

    return { confirm, modalProps };
}
