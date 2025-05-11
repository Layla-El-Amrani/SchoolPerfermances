import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    maxWidth: '600px',
                    margin: '20px auto',
                    textAlign: 'center'
                }}>
                    <h2>Une erreur est survenue</h2>
                    <p>Veuillez rafraîchir la page ou contacter l'administrateur.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
