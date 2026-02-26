let globalSetToasts = null;
let toastId = 0;

export const registerToastSetter = (setter) => {
    globalSetToasts = setter;
};

export const showToast = (message, type = 'info', duration = 4000) => {
    if (globalSetToasts) {
        const id = ++toastId;
        globalSetToasts(prev => [...prev, { id, message, type, duration }]);
    }
};
