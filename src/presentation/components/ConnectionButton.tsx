import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
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
        
        // Use React Native Alert instead of web alert
        Alert.alert(
            "Résultat du test",
            result ? "✅ Base de donnée OK" : "❌ Erreur de connexion",
            [{ text: "OK" }]
        );
    };

    return (
        <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handlePress}
            disabled={loading}
        >
            <Text style={styles.buttonText}>
                {loading ? "Connexion..." : "Tester connexion"}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 150,
    },
    buttonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
