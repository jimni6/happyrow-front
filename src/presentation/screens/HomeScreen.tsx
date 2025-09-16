import React from "react";
import "./HomeScreen.css";
import { ConnectionButton } from "../components/ConnectionButton";
import { CheckConnection } from "../../application/checkConnection";
import { ConnectionApiRepository } from "../../infrastructure/ConnectionApiRepository";
import { apiConfig } from "../../config/api";

const repo = new ConnectionApiRepository(apiConfig.baseUrl);
const checkConnection = new CheckConnection(repo);

export const HomeScreen: React.FC = () => {
    return (
        <div className="container">
            <ConnectionButton useCase={checkConnection} />
        </div>
    );
};
