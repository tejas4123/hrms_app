export function LoadingSpinner({ text = "Loading..." }) {
    return (
        <div className="loading-container">
            <div className="spinner" />
            <p className="loading-text">{text}</p>
        </div>
    );
}

export function EmptyState({ icon = "📭", title, message }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{message}</p>
        </div>
    );
}

export function ErrorState({ message, onRetry }) {
    return (
        <div className="error-state">
            <div className="error-state-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{message}</p>
            {onRetry && (
                <button className="btn btn-secondary btn-sm" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
