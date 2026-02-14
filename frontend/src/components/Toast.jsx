import { useState, useEffect, useCallback } from "react";

export default function Toast({ message, type = "success", onClose }) {
    const [visible, setVisible] = useState(true);

    const dismiss = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(dismiss, 3500);
        return () => clearTimeout(timer);
    }, [dismiss]);

    if (!visible) return null;

    return (
        <div className={`toast toast-${type}`}>
            {type === "success" ? "✅" : "❌"} {message}
        </div>
    );
}
