import {
	RESTPostMessageJSONBody,
	APIEmbed,
	RESTGetMessagesQuery,
	RESTPutMessageJSONBody,
} from 'guilded-api-typings';
import { EmbedBuilder } from '@guildedts/builders';
import { BaseManager, FetchManyOptions, FetchOptions } from '../BaseManager';
import { Message } from '../../structures/message/Message';
import { ChatChannel } from '../../structures/channel/ChatChannel';
import { Collection } from '@discordjs/collection';

/**
 * The manager for messages
 */
export class MessageManager extends BaseManager<string, Message> {
	/**
	 * @param channel The chat channel
	 */
	constructor(public readonly channel: ChatChannel) {
		super(channel.client, channel.client.options.maxMessageCache);
	}

	/**
	 * Fetch a message from the channel
	 * @param message The message
	 * @param options The options to fetch the message with
	 * @returns The fetched message
	 */
	fetch(message: string | Message, options?: FetchOptions): Promise<Message>;
	/**
	 * Fetch messages from the channel
	 * @param options The options to fetch the messages with
	 * @returns The fetched messages
	 */
	fetch(options?: MessageFetchManyOptions): Promise<Collection<string, Message>>;
	fetch(arg1?: string | Message | MessageFetchManyOptions, arg2?: FetchOptions) {
		if (typeof arg1 === 'string' || arg1 instanceof Message)
			return this.fetchSingle(arg1, arg2);
		return this.fetchMany(arg1);
	}

	private async fetchSingle(message: string | Message, options?: FetchOptions) {
		message = message instanceof Message ? message.id : message;
		const cached = this.cache.get(message);
		if (cached && !options?.force) return cached;
		const raw = await this.client.api.messages.fetch(this.channel.id, message);
		return new Message(this.channel, raw, options?.cache);
	}

	private async fetchMany(options?: MessageFetchManyOptions) {
		const raw = await this.client.api.messages.fetch(this.channel.id, options);
		const messages = new Collection<string, Message>();
		for (const data of raw) {
			const message = new Message(this.channel, data, options?.cache);
			messages.set(message.id, message);
		}
		return messages;
	}

	/**
	 * Create a message in the channel
	 * @param payload The payload of the message
	 * @returns The created message
	 */
	async create(payload: MessagePayloadResolvable) {
		const raw = await this.client.api.messages.create(
			this.channel.id,
			(typeof payload === 'string'
				? { content: payload }
				: Array.isArray(payload)
				? { embeds: payload }
				: payload) as RESTPostMessageJSONBody,
		);
		return new Message(this.channel, raw);
	}

	/**
	 * Edit a message in the channel
	 * @param message The message
	 * @param payload The payload of the message
	 * @returns The edited message
	 */
	async edit(message: string | Message, payload: MessageEditPayloadResolvable) {
		message = message instanceof Message ? message.id : message;
		const raw = await this.client.api.messages.edit(
			this.channel.id,
			message,
			(typeof payload === 'string'
				? { content: payload }
				: Array.isArray(payload)
				? { embeds: payload }
				: payload) as RESTPutMessageJSONBody,
		);
		return new Message(this.channel, raw);
	}

	/**
	 * Delete a message from the channel
	 * @param message The message
	 */
	delete(message: string | Message) {
		message = message instanceof Message ? message.id : message;
		return this.client.api.messages.delete(this.channel.id, message);
	}
}

/**
 * The options for fetching messages
 */
export interface MessageFetchManyOptions extends FetchManyOptions, RESTGetMessagesQuery {}

/**
 * The payload for creating a message
 */
export interface MessagePayload extends Omit<RESTPostMessageJSONBody, 'embeds'> {
	/**
	 * The embeds of the message
	 */
	embeds?: (EmbedBuilder | APIEmbed)[];
}

/**
 * The payload for editing a message
 */
export interface MessageEditPayload extends Omit<RESTPutMessageJSONBody, 'embeds'> {
	/**
	 * The embeds of the message
	 */
	embeds?: (EmbedBuilder | APIEmbed)[];
}

/**
 * The resolvable payload for creating a message
 */
export type MessagePayloadResolvable = string | (EmbedBuilder | APIEmbed)[] | MessagePayload;

/**
 * The resolvable payload for editing a message
 */
export type MessageEditPayloadResolvable =
	| string
	| (EmbedBuilder | APIEmbed)[]
	| MessageEditPayload;
