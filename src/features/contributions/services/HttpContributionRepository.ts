import type {
  Contribution,
  ContributionCreationRequest,
  ContributionUpdateRequest,
} from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

// API request body format that matches backend
interface ContributionApiRequest {
  quantity: number;
}

// API response interface for contributions
interface ContributionApiResponse {
  identifier: string;
  event_id: string;
  resource_id: string;
  user_id: string;
  quantity: number;
  creation_date: number;
}

export class HttpContributionRepository implements ContributionRepository {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(
    getToken: () => string | null,
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      'https://happyrow-core.onrender.com/event/configuration/api/v1'
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  async getContributionsByResource(params: {
    eventId: string;
    resourceId: string;
  }): Promise<Contribution[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${params.eventId}/resources/${params.resourceId}/contributions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contributionsResponse: ContributionApiResponse[] =
      await response.json();
    return contributionsResponse.map(c => this.mapApiResponseToContribution(c));
  }

  async createContribution(
    data: ContributionCreationRequest
  ): Promise<Contribution> {
    const apiRequest: ContributionApiRequest = {
      quantity: data.quantity,
    };

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${data.eventId}/resources/${data.resourceId}/contributions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    return this.mapApiResponseToContribution(contributionResponse);
  }

  async updateContribution(params: {
    eventId: string;
    resourceId: string;
    data: ContributionUpdateRequest;
  }): Promise<Contribution> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const apiRequest: ContributionApiRequest = {
      quantity: params.data.quantity || 0,
    };

    const response = await fetch(
      `${this.baseUrl}/events/${params.eventId}/resources/${params.resourceId}/contributions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
    return this.mapApiResponseToContribution(contributionResponse);
  }

  async deleteContribution(params: {
    eventId: string;
    resourceId: string;
  }): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${params.eventId}/resources/${params.resourceId}/contributions`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private mapApiResponseToContribution(
    response: ContributionApiResponse
  ): Contribution {
    return {
      id: response.identifier,
      eventId: response.event_id,
      resourceId: response.resource_id,
      userId: response.user_id,
      quantity: response.quantity,
      createdAt: new Date(response.creation_date),
    };
  }
}
