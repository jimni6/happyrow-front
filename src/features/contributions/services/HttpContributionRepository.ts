import type {
  Contribution,
  ContributionCreationRequest,
  ContributionUpdateRequest,
  ContributionType,
} from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

// API request body format that matches backend
interface ContributionApiRequest {
  eventId: string; // Event IDs are UUID strings
  name: string;
  quantity: number;
  type: string;
}

// API response interface for contributions
interface ContributionApiResponse {
  id: number;
  eventId: string; // Event IDs are UUID strings
  userId: string;
  name: string;
  quantity: number;
  type: string;
  createdAt: string;
}

export class HttpContributionRepository implements ContributionRepository {
  private baseUrl: string;

  constructor(
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      'https://happyrow-core.onrender.com/event/configuration/api/v1'
  ) {
    this.baseUrl = baseUrl;
  }

  private mapStringToContributionType = (type: string): ContributionType =>
    type.toUpperCase() as ContributionType;

  async getContributionsByEvent(eventId: string): Promise<Contribution[]> {
    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/contributions`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contributionsResponse: ContributionApiResponse[] =
      await response.json();
    return contributionsResponse.map(contribution => ({
      id: contribution.id,
      eventId: contribution.eventId,
      userId: contribution.userId,
      name: contribution.name,
      quantity: contribution.quantity,
      type: this.mapStringToContributionType(contribution.type),
      createdAt: new Date(contribution.createdAt),
    }));
  }

  async createContribution(
    data: ContributionCreationRequest
  ): Promise<Contribution> {
    const apiRequest: ContributionApiRequest = {
      eventId: data.eventId,
      name: data.name,
      quantity: data.quantity,
      type: data.type,
    };

    const response = await fetch(
      `${this.baseUrl}/events/${data.eventId}/contributions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': data.userId,
        },
        body: JSON.stringify(apiRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contributionResponse: ContributionApiResponse = await response.json();
    return {
      id: contributionResponse.id,
      eventId: contributionResponse.eventId,
      userId: contributionResponse.userId,
      name: contributionResponse.name,
      quantity: contributionResponse.quantity,
      type: this.mapStringToContributionType(contributionResponse.type),
      createdAt: new Date(contributionResponse.createdAt),
    };
  }

  async updateContribution(
    id: number,
    data: ContributionUpdateRequest
  ): Promise<Contribution> {
    const response = await fetch(`${this.baseUrl}/contributions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contributionResponse: ContributionApiResponse = await response.json();
    return {
      id: contributionResponse.id,
      eventId: contributionResponse.eventId,
      userId: contributionResponse.userId,
      name: contributionResponse.name,
      quantity: contributionResponse.quantity,
      type: this.mapStringToContributionType(contributionResponse.type),
      createdAt: new Date(contributionResponse.createdAt),
    };
  }

  async deleteContribution(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/contributions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}
