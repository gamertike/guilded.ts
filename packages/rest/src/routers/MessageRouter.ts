import {
	APIFetchMessagesQuery,
	APIMessage,
	APIMessageEditPayload,
	APIMessagePayload,
	Routes,
} from 'guilded-api-typings';
import { BaseRouter } from './BaseRouter';

/** The message router for the Guilded REST API. */
export class MessageRouter extends BaseRouter {
	/** @ignore */
	public fetch(channelId: string, messageIdOrOptions?: string | APIFetchMessagesQuery) {
		if (typeof messageIdOrOptions === 'string')
			return this.fetchSingle(channelId, messageIdOrOptions);
		return this.fetchMany(channelId, messageIdOrOptions);
	}

	/** @ignore */
	private async fetchSingle(channelId: string, messageId: string) {
		const { message } = await this.rest.get<{ message: APIMessage }>(
			Routes.message(channelId, messageId),
		);
		return message;
	}

	/** @ignore */
	private async fetchMany(channelId: string, options?: APIFetchMessagesQuery) {
		const { messages } = await this.rest.get<{ messages: APIMessage[] }, APIFetchMessagesQuery>(
			Routes.messages(channelId),
			options,
		);
		return messages;
	}

	/**
	 * Create a message on Guilded.
	 * @param channelId The ID of the channel the message belongs to.
	 * @param payload The payload to create the message with.
	 * @returns The created message.
	 */
	public async create(channelId: string, payload: string | APIMessagePayload) {
		const { message } = await this.rest.post<{ message: APIMessage }, APIMessagePayload>(
			Routes.messages(channelId),
			typeof payload === 'string' ? { content: payload } : payload,
		);
		return message;
	}

	/**
	 * Edit a message on Guilded.
	 * @param channelId The ID of the channel the message belongs to.
	 * @param messageId The ID of the message to edit.
	 * @param payload The payload to edit the message with.
	 * @returns The edited message.
	 */
	public async edit(channelId: string, messageId: string, payload: string | APIMessageEditPayload) {
		const { message } = await this.rest.put<{ message: APIMessage }, APIMessageEditPayload>(
			Routes.message(channelId, messageId),
			typeof payload === 'string' ? { content: payload } : payload,
		);
		return message;
    }
    
    /**
     * Delete a message from Guilded.
     * @param channelId The ID of the channel the message belongs to.
     * @param messageId The ID of the message to delete.
     */
    public delete(channelId: string, messageId: string) {
        return this.rest.delete<void>(Routes.message(channelId, messageId));
    }
}

export declare interface MessageRouter {
	/**
	 * Fetch a message from Guilded.
	 * @param channelId The ID of the channel the message belongs to.
	 * @param messageId The ID of the message to fetch.
	 * @returns The fetched message.
	 */
	fetch(channelId: string, messageId: string): Promise<APIMessage>;

	/**
	 * Fetch messages from Guilded.
	 * @param channelId The ID of the channel the messages belong to.
	 * @param options The options to fetch messages with.
	 * @returns The fetched messages.
	 */
	fetch(channelId: string, options?: APIFetchMessagesQuery): Promise<APIMessage[]>;
}