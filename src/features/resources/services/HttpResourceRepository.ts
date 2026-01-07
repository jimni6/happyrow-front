import type {
  Resource,
  ResourceCreationRequest,
  ResourceUpdateRequest,
  ResourceCategory,
} from '../types/Resource';
import type { ResourceRepository } from '../types/ResourceRepository';

interface ResourceApiRequest {
  name: string;
  category: string;
  quantity: number;
  suggested_quantity?: number;
}

interface ResourceApiResponse {
  identifier: string;
  event_id: string;
  name: string;
  category: string;
  quantity: number;
  suggested_quantity?: number;
  creation_date: number;
  update_date?: number;
}

export class HttpResourceRepository implements ResourceRepository {
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

  private mapStringToResourceCategory = (category: string): ResourceCategory =>
    category.toUpperCase() as ResourceCategory;

  async createResource(data: ResourceCreationRequest): Promise<Resource> {
    const apiRequest: ResourceApiRequest = {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      suggested_quantity: data.suggestedQuantity,
    };

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${data.eventId}/resources`,
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

    const resourceResponse: ResourceApiResponse = await response.json();
    return this.mapApiResponseToResource(resourceResponse);
  }

  async getResourcesByEvent(eventId: string): Promise<Resource[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/resources`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resourcesResponse: ResourceApiResponse[] = await response.json();
    return resourcesResponse.map(r => this.mapApiResponseToResource(r));
  }

  async getResourceById(id: string): Promise<Resource | null> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/resources/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resourceResponse: ResourceApiResponse = await response.json();
    return this.mapApiResponseToResource(resourceResponse);
  }

  async updateResource(
    id: string,
    data: ResourceUpdateRequest
  ): Promise<Resource> {
    const apiRequest: Partial<ResourceApiRequest> = {};
    if (data.name) apiRequest.name = data.name;
    if (data.category) apiRequest.category = data.category;
    if (data.quantity !== undefined) apiRequest.quantity = data.quantity;
    if (data.suggestedQuantity !== undefined)
      apiRequest.suggested_quantity = data.suggestedQuantity;

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const resourceResponse: ResourceApiResponse = await response.json();
    return this.mapApiResponseToResource(resourceResponse);
  }

  async deleteResource(id: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/resources/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private mapApiResponseToResource(response: ResourceApiResponse): Resource {
    return {
      id: response.identifier,
      eventId: response.event_id,
      name: response.name,
      category: this.mapStringToResourceCategory(response.category),
      quantity: response.quantity,
      suggestedQuantity: response.suggested_quantity,
      createdAt: new Date(response.creation_date),
      updatedAt: response.update_date
        ? new Date(response.update_date)
        : undefined,
    };
  }
}
