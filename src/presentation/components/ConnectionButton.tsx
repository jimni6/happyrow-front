import React, { useState } from "react";
import "./ConnectionButton.css";
import { CheckConnection } from "../../application/checkConnection";

type Props = {
    useCase: CheckConnection;
};

export const ConnectionButton: React.FC<Props> = ({ useCase }) => {
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        setLoading(true);
        const result = await useCase.execute();
        setLoading(false);
        alert(result ? "✅ Base de donnée OK" : "❌ Erreur de connexion");
    };

    return (
        <button 
            className="connection-button" 
            onClick={handlePress}
            disabled={loading}
        >
            {loading ? "Connexion..." : "Tester connexion"}
        </button>
    );
};