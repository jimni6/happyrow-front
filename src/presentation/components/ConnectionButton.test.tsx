import { render, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConnectionButton } from "./ConnectionButton";
import { CheckConnection } from "../../application/checkConnection";

describe("ConnectionButton", () => {
    it("affiche une alerte quand on clique", async () => {
        // Mock the alert function
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        const mockUseCase = {
            execute: vi.fn().mockResolvedValue(true),
        } as unknown as CheckConnection;

        const { getByText } = render(<ConnectionButton useCase={mockUseCase} />);
        const button = getByText("Tester connexion");

        await act(async () => {
            fireEvent.click(button);
        });

        expect(mockUseCase.execute).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith("✅ Base de donnée OK");
        
        // Clean up
        alertSpy.mockRestore();
    });
});